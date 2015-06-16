<div class="bar bar-header bar-positive">
  <a class="back-btn button icon-left ion-ios-arrow-left button-clear button-light"></a>
  <h1 class="group-name title">{{=groupName}}</h1>
  <button class="sort-btn button button-icon icon ion-ios-keypad-outline"></button>
</div>
<div class="sort-selections">
  <ul class="list">
    <a class="item" data-orderby="displayName" data-order="DESC">
      名称
      <i class="asc icon ion-ios-arrow-up"></i>
      <i class="desc icon ion-ios-arrow-down"></i>
    </a>
    <a class="item" data-orderby="created" data-order="DESC">
      加入时间
      <i class="asc icon ion-ios-arrow-up"></i>
      <i class="desc icon ion-ios-arrow-down"></i>
    </a>
    <!--
    <a class="item" data-orderby="xxx" data-order="DESC">
      活跃度
      <i class="asc icon ion-ios-arrow-up"></i>
      <i class="desc icon ion-ios-arrow-down"></i>
    </a>
    -->
  </ul>
</div>
<div class="member-content scroll-content ionic-scroll has-header">
  <div class="scroll">
    <ul class="list">
      <li class="master-divider item item-divider">营养师<span class="counter positive-bg light"></span></li>
      <ul class="masters"></ul>
      <li class="member-divider item item-divider">会员<span class="counter positive-bg light"></span></li>
      <ul class="members"></ul>
    </ul>
  </div>
</div>