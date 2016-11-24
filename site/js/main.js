execWhenLoaded(function() {
  var uinfo = APIRequest("/me");
  var wall = APIRequest("/me/feed").data;

  var timelineContainer = getElement("#tmline");

  // only place user posts into post list
  var posts = [];
  for (var i = 0; i < wall.length; i++) {
    // only user-made posts contain the message key
    if (wall[i].message) {
      posts.push(wall[i]);
    }
  }

  // create array of objects to be used with the word cloud
  var words = [];
  for (var i = 0; i < posts.length; i++) {
    var split_post = posts[i].message.replace(/,/g, "").replace(/!/g, "").split(" ");
    for (var j = 0; j < split_post.length; j++) {
      var found = false;
      if (words.length > 0) {
        for (var k = 0; k < words.length; k++) {
          if (words[k].text == split_post[j]) {
            found = true;
            words[words.indexOf(words[k])].weight += 1;
          }
        }
      }
      if (!found) {
        words.push({"text": split_post[j], "weight": 1});
      }
    }
  }

  var times = [];
  for (var i = 0; i < posts.length; i++) {
    times.push({"id": i + 1, "content": posts[i].message, "start": new Date(posts[i].created_time)});
  }
  var tl = new vis.Timeline(timelineContainer, times, {
    "timeAxis": {"scale": "hour", "step": 1}
  });

  window["wall"] = wall;
  window["posts"] = posts;
  window["words"] = words;
  window["times"] = times;

  $("#wcloud").jQCloud(words, {
    "removeOverflowing": false
  });
});
