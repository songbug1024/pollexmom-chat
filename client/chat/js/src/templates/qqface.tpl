<div class="scroll">
  {{
  var index;
  for (var i = 0; i < rows; i++) {
  }}
  <div class="row">
    {{
    for (var j = 0; j < cols; j++) {
      index = i * cols + j + 1;
      if (index <= max)
    }}
      <div class="col" data-index="{{=index}}"><img data-src="{{=faceRoot}}/{{=index}}.gif"/></div>
      {{
      else
      }}
      <div class="col"></div>
    {{
    }
    }}
  </div>
  {{
  }
  }}
</div>
