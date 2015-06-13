<img src="{{=avatar}}">
<h2>{{=displayName}}</h2>
<p>{{=desc}}</p>
{{
  if (!isMe) {
}}
<button class="at-btn button button-icon icon ion-ios-at-outline"></button>
{{
  }
}}