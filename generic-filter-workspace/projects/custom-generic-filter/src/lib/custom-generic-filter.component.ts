import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'lib-custom-generic-filter',
  templateUrl:'./custom-generic-filter.component.html',
  styleUrls: ['./custom-generic-filter.component.css'
  ]
})
export class CustomGenericFilterComponent implements OnInit {

  @Input("tableData") tableData: any = []; 
  @Input("categories") categories = [{label:'',key:'',arrayObj:''}]; //mandatory: format = [{label:'',key:'',arrayObj:''}];  | arrayObj = array object name / "1D" (when no object present)
  @Input("categoryItems") categoryItems:any=[{ name:'',listItem:[]}] ; //mandatory: format = [{ name:'',listItem:[]}]  
  @Input("preFillFilter") preFillFilter = [];
  @Input("itemsShowLimit") itemsShowLimit = 1;
  @Input ("allowSearchFilter") allowSearchFilter = true;

  @Output() applyFilter = new EventEmitter<any>(); // Output: format = {filter:any,filteredData:any} where filter= [{key:'', value:'', label:'',isFilterApplied: true/false}]

    public SelectedFilterItems = [];
    public selectedKey='';
    public item='';
    public selectedFinalItem: any = [];
    public dropDownOpen=false;
    public selectedValue='';
    public fromTime = moment().subtract(3, 'hours').format('LT');;
    public toTime = moment().format('LT');;
    public appliedFilter: any;
    public filteredTableData: any;
    public isFilterApplied: boolean = false;
    public searchWord=''
    public searchList:any;
    public showLimit=1;
    constructor() {}

    ngOnInit() {
      if(this.tableData.length){
      this.filteredTableData=JSON.parse(JSON.stringify(this.tableData));
      this.Apply();
      }
    }

  //---------------- open filter modal ---------------- 
    openFilter(){
      this.dropDownOpen =! this.dropDownOpen;
      if(this.categoryItems.length>1 && this.categoryItems[0].name == ''){
        this.categoryItems.shift();
      }
      this.preFilledFilter()
      this.selectedKey = this.categoryItems[0].name;
      this.showItem(this.selectedKey);
      this.showLimit = this.itemsShowLimit;
    }

  //---------------- pre fill filter ---------------- 
    preFilledFilter(){
      this.selectedFinalItem = (this.preFillFilter.length)?[...this.preFillFilter]:[{ key: "" ,value: "" }];
      this.selectedValue='';
      const sIndex = this.selectedFinalItem.findIndex((categoryItem:any) => categoryItem.key == 'time');
      if(sIndex != -1){
        let split = this.selectedFinalItem[sIndex].value.split("-");
        this.fromTime = split[0]||'';
        this.toTime = split[1]||'';
      }
    }

  //---------------- on selecting a sidebar category item ---------------- 
  selectItem(selectedItem:any){
    if(!this.selectedKey || !selectedItem){
      return;
    }
    const labelIndex = this.categories.findIndex((categoryItem:any) => categoryItem.key == this.selectedKey);
    let Value = {key:this.selectedKey, value:selectedItem, label:this.categories[labelIndex].label, isFilterApplied: false};
    this.selectedValue = selectedItem;
      const sIndex = this.selectedFinalItem.findIndex((categoryItem:any) => categoryItem.key == this.selectedKey);
    if(sIndex != -1){
      this.selectedFinalItem[sIndex] = Value;
    }else if(this.selectedFinalItem[0].key == '' && this.selectedFinalItem[0].value == ''){
      this.selectedFinalItem[0] = Value;
    }else {
      this.selectedFinalItem[this.selectedFinalItem.length] = Value;
    }
  }

  //---------------- render selected category item ---------------- 
    showItem(item:any){
      this.selectedKey = item;
      this.searchWord = '';
      const sIndex = this.categoryItems.findIndex((categoryItem:any) => categoryItem.name == item);
      if(sIndex != -1){
        this.SelectedFilterItems = this.categoryItems[sIndex].listItem;
        this.searchList = this.SelectedFilterItems;
        this.setSelectedValue()
      }
    }

    setSelectedValue(){
      const Index = this.selectedFinalItem.findIndex((selectedItem:any) => selectedItem.key == this.selectedKey);
      if(Index != -1){
        this.selectedValue = this.selectedFinalItem[Index].value;
      }
    }

  //---------------- set Time  ---------------- 
    setTime(type: string, event:any) {
      if (type == "fromTime") {
          this.fromTime = event;
      }else {
          this.toTime = event;
      };
      let value = this.fromTime+"-"+this.toTime;
      this.selectItem(value)
    }

  //---------------- check existing category ---------------- 
    checkSelectedCategory(categoryKey:any){
      const sIndex = this.selectedFinalItem.findIndex((categoryItem:any) => categoryItem.key == categoryKey);
      if(sIndex != -1){
        return true;
      } else{
        return false;
      }
    }


  //---------------- for search ---------------- 
  searchThis(){
    this.searchList =this.SelectedFilterItems;
    this.searchList = this.SelectedFilterItems.filter(item => this.findUserInfo(item, this.searchWord ))
  }

  findUserInfo(userName:any, searchString:any){
    return userName.toLowerCase().substr(0,searchString.length).includes(searchString.toLowerCase());
  }

  //---------------- on apply filter  ---------------- 
    Apply(){
      this.filteredTableData = JSON.parse(JSON.stringify(this.tableData));;
      if(!this.selectedFinalItem.length||this.selectedFinalItem.length == 1 && (!this.selectedFinalItem[0].key ||!this.selectedFinalItem[0].value)){
        this.selectedFinalItem = [];
        this.isFilterApplied = false;
      }
      if(this.selectedFinalItem.length){
        this.isFilterApplied = true;
      }
      this.FilterData();
      this.appliedFilter = this.selectedFinalItem;
      let event: {filter:any,filteredData:any};
      event = {filter:this.selectedFinalItem, filteredData:this.filteredTableData}
      this.applyFilter.emit(event);
      this.modalClose();
    }

  //---------------- filter Data ---------------- 
    FilterData(){
      if(!this.filteredTableData.length){
        return;
      }
      this.selectedFinalItem.forEach( (savedFilter:any) =>{
        // check key exist in array or not
        let exists = this.filteredTableData.filter(function (o:any) {
          return o.hasOwnProperty(savedFilter.key);
        }).length > 0;
        if(exists){
          this.filterItem(savedFilter);
        }
        
      })
    }

    filterItem(savedFilter :any){
      const sIndex = this.categories.findIndex(categoryItem => categoryItem.key == savedFilter.key);
      let objName=this.categories[sIndex].arrayObj;
      if(objName){
        savedFilter.isFilterApplied = true;
        this.filteredTableData = _.filter(this.filteredTableData, (item:any) => {
          let index;
          (objName=='1D')?
          index = item[savedFilter.key].findIndex((item1:any)=> item1 == savedFilter.value):
          index = item[savedFilter.key].findIndex((item2:any)=> item2[objName] == savedFilter.value);
          if (index > -1) {
              return true;
          }else{
            return false;
          }
        })
      }
      else{
        savedFilter.isFilterApplied = true;
        this.filteredTableData = this.filteredTableData.filter((item:any) => item[savedFilter.key] == savedFilter.value);
      }
    }


  //---------------- reset filter  ---------------- 
  reset(){
    this.selectedFinalItem = [];
    this.fromTime = '';
    this.toTime = '';
    this.isFilterApplied = false;
    this.filteredTableData = JSON.parse(JSON.stringify(this.tableData));
    this.Apply();
  }

  //---------------- remove filter ---------------- 
  removeFilter(item:any){
    const Index = this.selectedFinalItem.findIndex((categoryItem :any)=> categoryItem.key == item.key);
    if(Index != -1){
      this.selectedFinalItem.splice(Index, 1);
      this.Apply();
    }
  }

  //---------------- modal close ---------------- 
  modalClose(){
    this.dropDownOpen = false;
    this.fromTime = '';
    this.toTime = ''
  }

  //---------------- expand List ---------------- 
  expandList(){
    this.showLimit = this.appliedFilter.length;
  }

}
