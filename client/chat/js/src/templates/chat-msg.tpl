{{
  if (isMine) {
}}
<div class="info">
  <p class="username">{{=displayName}}</p>
  <p class="content">{{=content}}</p>
</div>
<img class="avatar" src="{{=avatar}}">
{{
  } else {
}}
<img class="avatar" src="{{=avatar}}">
<div class="info">
  <p class="username">{{=displayName}}</p>
  <p class="content">{{=content}}</p>
</div>
{{
  }
}}

