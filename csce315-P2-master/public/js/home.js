/*Global Variable which contains id and type of the meal/restaurant currently being viewed*/
window.currentlyViewing = {};
currentlyViewing.id = undefined;
currentlyViewing.type = undefined;

/*Global Variable which contains meals for each week */

var weekMealPlan ={ "MealPlan": [] };

var editMealPlan = []
/*Global Variable which contains the meal bein planned, resets when meal is added to Plan*/
window.tempMeal = {};
tempMeal.id;
tempMeal.type;
tempMeal.name;
tempMeal.calories;
tempMeal.price;
tempMeal.mealType;
tempMeal.dayOfWeek;


calorieIntake = 2000;
weeklyBudget = 100;
uname = "userId";

window.favorites = [];
window.blacklist = [];

function toggleSidePanel(show) {
  // only seems to work this way, weird if statement
  if (show) {
    $(".side_bar").toggleClass("side_bar_open");
  } else {
    $(".side_bar").toggleClass("side_bar_open", false);
  }
    $("#overlay").hide();
  $(".side_bar_search_console").hide();
  $(".side_bar_profile_console").hide();
  $(".side_bar_help_console").hide();
  $(".side_bar_calendar_console").hide();
  $(".side_bar_favorites_console").hide();
  $(".side_bar_blacklist_console").hide();
  $(".totals").empty();
  $(".meal_display").empty();
  $("div.title").text("");
  $(".favorites_display").empty();
  $(".blacklist_display").empty();
  //$(".side_bar_console").empty();
}

$(document).ready(function () {
  if (currentlyViewing.id == undefined) {
    $("#btnAdd").hide();
  } else {
    $("btnAdd").show();
  }
  //retrieveSessionMeal(); //set local meal plan
  /* Click an Icon */
  $(".navIcon").click(function (e) {
    if (e.target.classList.contains("logo")) {
      let out = "../welcome.html";
      $("#search_q_disp").attr("src", out);
      resetCurrentlyViewing(); //reset bc no meal is being view
      $("#btnAdd").hide(); //hide button
    } else if (e.target.classList.contains("logout")) {
      if (confirm("Are You sure you want to logout?")) {
        $('<form method="post" action="/logout"></form>')
          .appendTo("body")
          .submit();
      }
    } else {
      $(".side_bar").toggleClass("side_bar_open");
      $("#overlay").show();
    }
  });

  $.ajax({
    type: "POST",
    url: "/fetchUserProfile",
    data: {},
    success: (data) => {
      calorieIntake = data.calories;
      weeklyBudget = data.budget;
      uname = data.name;
    },
    failure: (err) => {
      console.log("unable to retreive user profile");
      console.log(err)
    }
  });

  retrieveFavoritesList(); // set local favorites
  retrieveBlacklist(); //set local blacklist

  /* Show Side Panel */
  $("#overlay").click(function () {
    toggleSidePanel(true);
  });

  /*Hide Side Panel*/
  $(".exit").click(function () {
    toggleSidePanel(false);
  });

  /* Append Contents to Search Console*/
  $(".side_bar").append('<div class="side_bar_search_console"></div>');
  var searchPane = $('<div class="search_pane"></div>');
  $(".side_bar_search_console").append(searchPane);
  var filterPane = $('<div id="filter"  class="filter_pane"></div>');
  var filterPane2 = $('<div id="filter2" class="filter_pane"></div>');
  var disp_pane = $('<div class="display_pane"></div>');
  $(".side_bar_search_console").append(filterPane);
  $(".side_bar_search_console").append(filterPane2);
  $(".side_bar_search_console").append(disp_pane);

  var leftsearchPane = $('<div class="search_pane_left"></div>');
  var rightsearchPane = $('<div class="search_pane_right"></div>');
  $(".search_pane").append(leftsearchPane);
  $(".search_pane").append(rightsearchPane);
  var leftsearchPane = $(
    '<div id="search_dropdown" class="search_dropdown_box" ></div>'
  );
  var rightsearchPane = $(
    '<input list="yelpAutocompleteItems" type="text" name="" placeholder="Food, Restaurants, & More" class="search_bar"></input><input type="button" value="Search" class="search_button"></input> <datalist id="yelpAutocompleteItems"/>'
  );
  $(".search_pane_left").append(leftsearchPane);
  $(".search_pane_right").append(rightsearchPane);
  var dropdown = $('<div id="search" class="dropdown" ></div>');
  $(document.getElementById("search_dropdown")).append(dropdown);
  var def = $('<div id="search_sel" class="selectedOp"><p>Recipes</p></div>');
  $(document.getElementById("search")).append(def);
  var menu = $('<ul id="search_list"></ul>');
  $(document.getElementById("search")).append(menu);
  $(document.getElementById("search_list")).append(
    '<li class="SearchOp">Recipes</li>'
  );
  $(document.getElementById("search_list")).append(
    '<li id="sel_rest" class="SearchOp">Restaurants</li>'
  );

  var leftFilterPane = $('<div id="leftPane" class="filter_pane_left"></div>');
  $(document.getElementById("filter")).append(leftFilterPane);
  var leftFilterPane = $(
    '<div id="price_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("leftPane")).append(leftFilterPane);
  var dropdown2 = $('<div id="price" class="dropdown"></div>');
  $(document.getElementById("price_dropdown")).append(dropdown2);
  var def2 = $('<div id="price_sel" class="selectedOp2"><p>Price</p></div>');
  $(document.getElementById("price")).append(def2);
  var menu2 = $('<ul id="price_list"></ul>');
  $(document.getElementById("price")).append(menu2);
  $(document.getElementById("price_list")).append(
    '<li class="SearchOp2">$</li>'
  );
  $(document.getElementById("price_list")).append(
    '<li class="SearchOp2">$$</li>'
  );
  $(document.getElementById("price_list")).append(
    '<li class="SearchOp2">$$$</li>'
  );
  $(document.getElementById("price_list")).append(
    '<li class="SearchOp2">$$$$</li>'
  );

  var midFilterPane = $('<div id="midPane" class="filter_pane_mid"></div>');
  $(document.getElementById("filter")).append(midFilterPane);
  var midFilterPane = $(
    '<div id="range_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("midPane")).append(midFilterPane);
  var dropdown3 = $('<div id="range" class="dropdown"></div>');
  $(document.getElementById("range_dropdown")).append(dropdown3);
  var def3 = $('<div id="range_sel" class="selectedOp3"><p>Distance</p></div>');
  $(document.getElementById("range")).append(def3);
  var menu3 = $('<ul id="range_list"></ul>');
  $(document.getElementById("range")).append(menu3);
  $(document.getElementById("range_list")).append(
    '<li class="SearchOp3">1 Mile</li>'
  );
  $(document.getElementById("range_list")).append(
    '<li class="SearchOp3">2 Miles</li>'
  );
  $(document.getElementById("range_list")).append(
    '<li class="SearchOp3">5 Miles</li>'
  );
  $(document.getElementById("range_list")).append(
    '<li class="SearchOp3">20 Miles</li>'
  );

  var rightFilterPane = $(
    '<div id="rightPane" class="filter_pane_right"></div>'
  );
  $(document.getElementById("filter")).append(rightFilterPane);
  var rightFilterPane = $(
    '<div id="sort_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("rightPane")).append(rightFilterPane);
  var dropdown4 = $('<div id="sort" class="dropdown"></div>');
  $(document.getElementById("sort_dropdown")).append(dropdown4);
  var def4 = $('<div id="sort_sel" class="selectedOp4"><p>Sort By</p></div>');
  $(document.getElementById("sort")).append(def4);
  var menu4 = $('<ul id="sort_list"></ul>');
  $(document.getElementById("sort")).append(menu4);
  $(document.getElementById("sort_list")).append(
    '<li class="SearchOp4"><p>Best Match</p></li>'
  );
  $(document.getElementById("sort_list")).append(
    '<li class="SearchOp4"><p>Rating</p></li>'
  );
  $(document.getElementById("sort_list")).append(
    '<li class="SearchOp4"><p>Distance</p></li>'
  );

  $(document.getElementById("filter")).hide();

  var leftFilterPane2 = $(
    '<div id="leftPane2" class="filter_pane_left"></div>'
  );
  $(document.getElementById("filter2")).append(leftFilterPane2);
  var leftFilterPane2 = $(
    '<div id="type_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("leftPane2")).append(leftFilterPane2);
  var dropdown5 = $('<div id="type" class="dropdown"></div>');
  $(document.getElementById("type_dropdown")).append(dropdown5);
  var def5 = $('<div id="type_sel" class="selectedOp5"><p>Meal Type</p></div>');
  $(document.getElementById("type")).append(def5);
  var menu5 = $('<ul id="type_list"></ul>');
  $(document.getElementById("type")).append(menu5);
  $(document.getElementById("type_list")).append(
    '<li class="SearchOp5">Breakfast</li>'
  );
  $(document.getElementById("type_list")).append(
    '<li class="SearchOp5">Main Course</li>'
  );
  $(document.getElementById("type_list")).append(
    '<li class="SearchOp5">Side Dish</li>'
  );
  $(document.getElementById("type_list")).append(
    '<li class="SearchOp5">Snack</li>'
  );

  var midFilterPane2 = $('<div id="midPane2" class="filter_pane_mid"></div>');
  $(document.getElementById("filter2")).append(midFilterPane2);
  var midFilterPane2 = $(
    '<div id="sortby_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("midPane2")).append(midFilterPane2);
  var dropdown6 = $('<div id="sortby" class="dropdown"></div>');
  $(document.getElementById("sortby_dropdown")).append(dropdown6);
  var def6 = $('<div id="sortby_sel" class="selectedOp6"><p>Sort By</p></div>');
  $(document.getElementById("sortby")).append(def6);
  var menu6 = $('<ul id="sortby_list"></ul>');
  $(document.getElementById("sortby")).append(menu6);
  $(document.getElementById("sortby_list")).append(
    '<li class="SearchOp6">Price</li>'
  );
  $(document.getElementById("sortby_list")).append(
    '<li class="SearchOp6">Healthiness</li>'
  );

  var rightFilterPane2 = $(
    '<div id="rightPane2" class="filter_pane_right"></div>'
  );
  $(document.getElementById("filter2")).append(rightFilterPane2);
  var rightFilterPane2 = $(
    '<div id="sort_direct_dropdown" class="search_dropdown_box"></div>'
  );
  $(document.getElementById("rightPane2")).append(rightFilterPane2);
  var dropdown7 = $('<div id="sort_direct" class="dropdown"></div>');
  $(document.getElementById("sort_direct_dropdown")).append(dropdown7);
  var def7 = $(
    '<div id="sort_direct_sel" class="selectedOp7"><p>Sort Direction</p></div>'
  );
  $(document.getElementById("sort_direct")).append(def7);
  var menu7 = $('<ul id="sort_direct_list"></ul>');
  $(document.getElementById("sort_direct")).append(menu7);
  $(document.getElementById("sort_direct_list")).append(
    '<li class="SearchOp7">Ascending</li>'
  );
  $(document.getElementById("sort_direct_list")).append(
    '<li class="SearchOp7">Descending</li>'
  );

  /*Append to Profile Console */
  $(".side_bar").append('<div class="side_bar_profile_console"></div>');
  var preferencePane = $(
    '<form class="preference_pane" method="post" action="/pref/save" onsubmit="updatePage()"></form>'
  );
  $(".side_bar_profile_console").append(preferencePane);
  $(".preference_pane").append('<p id="uname">Welcome,  </p>');
  $(".preference_pane").append('<h4 id="calories">Your Calorie Intake: </h4>');
  $(".preference_pane").append('<h4 id ="budget">Your Weekly budget: </h4>');
  $(".preference_pane").append("<br/>");
  var calorieInput = $(
    '<p>Input Desired Calorie Intake: <input id="updatecal" type="number" name="calories" class="preference_input" min="0"></input></p>'
  );
  $(".preference_pane").append(calorieInput);
  var moneyInput = $(
    '<p>Input Desired Weekly Budget: <input id="updatebudget" type="number" name="money" class="preference_input" min="0"></input></p>'
  );
  $(".preference_pane").append(moneyInput);
  var preferenceSubmit = $(
    '<input type="submit" class="preference_submit" Value="SavePreferences"></input>'
  );
  $(".preference_pane").append(preferenceSubmit);

  /*Append To Favorites Console*/
  $(".side_bar").append('<div class="side_bar_favorites_console"></div>');
  var fav_disp_pane = $('<div class="favorites_display"></div>');
  $(".side_bar_favorites_console").append(fav_disp_pane);

  /*Append To Blacklist Console*/
  $(".side_bar").append('<div class="side_bar_blacklist_console"></div>');
  var blacklist_disp_pane = $('<div class="blacklist_display"></div>');
  $(".side_bar_blacklist_console").append(blacklist_disp_pane);

  /*Append To Calendar Console*/
  $(".side_bar").append('<div class="side_bar_calendar_console"></div>');
  $(".side_bar_calendar_console").append('<div class="totals"></div>');
  var meal_disp_pane = $('<div class="meal_display"></div>');
  $(".side_bar_calendar_console").append(meal_disp_pane);

  /*Append to Help Console*/
  $(".side_bar").append('<div class="side_bar_help_console"></div>');
  var helpPane = $('<div class="help_pane"></div>');
  $(".side_bar_help_console").append(helpPane);
  $(".help_pane").append("<h3>My Restaurant Search Does Not Work</h3>");
  var help_geography_text = $(
    "<p>Our Restaurant Search Uses Geolocation. Please make sure that Geolocation Services and Permissions are turned on for your browser </p><br/>"
  );
  $(".help_pane").append(help_geography_text);
  $(".help_pane").append("<h3>Insecure Pages</h3>");
  var insecure_pages_text = $(
    "<p>We browse the web for all your favorite recipes, but some pages are insecure and may be blocked by default by your browser. To get the full BMR experience, we suggest allowing for these Insecure Pages. This can be changed in your browser settings.</p>"
  );
  $(".help_pane").append(insecure_pages_text);

  $(".logo").click(function () {
    $("div.title").text("About MyBMR");
  });
  $(".search").click(function () {
    $("div.title").text("Lookup");
    $(".side_bar_search_console").show();
  });
  $(".profile").click(function () {
    $("div.title").text("My Profile");
    $(".side_bar_profile_console").show();
    $("#uname").find("#n_val").remove();
    $("#calories").find("#c_val").remove();
    $("#budget").find("#b_val").remove();
    $("#uname").append(
      '<p id ="n_val" style="display: inline-block; font-size: larger;">' +
        uname +
        "!</p>"
    );
    $("#calories").append(
      '<p id ="c_val" style="display: inline-block;">' + calorieIntake + "</p>"
    );
    $("#budget").append(
      '<p id ="b_val" style="display: inline-block;">' + weeklyBudget + "</p>"
    );

    //Information
    /*
		 Display email and current preferences
		 */

    //Preferences
  });

  /*Favorites OnClick*/
  $(".favorites").click(function () {
    $("div.title").text("Your Favorites List");
    $(".side_bar_favorites_console").show();
    printFavorites();
  });

  $(".blacklist").click(function () {
    $("div.title").text("Your Blacklist");
    $(".side_bar_blacklist_console").show();
    printBlacklist();
  });

  /*Calendar OnClick*/
  $(".calendar").click(function () {
    $("div.title").text("View Meal Plan");
    $(".side_bar_calendar_console").show();
    let totalCalories = calcCal();
    let totalPrice = calcPrice();
    if (totalCalories != 0 || totalPrice != 0) {
      if(totalCalories > calorieIntake * 7){
        alert("Your current meal plan has more calories than your preference!")
      }
      if (totalPrice > weeklyBudget) {
        alert("Your current meal plan is over budget!");
      }
      var totals = $(
        "<h4>Total Calories: " +
          JSON.stringify(totalCalories) +
          " Total Price: $" +
          JSON.stringify(totalPrice) +
          "</h4>" +
          "<p style='font-size:smaller'> *May not reflect exact total. See Help for more information </p>"
      );
      $(".totals").append(totals);
    } else {
      $(".totals").append("<h3>No Meals Added Yet :( </h3>");
    }

    updatePage2();
  });

  $(".help").click(function () {
    $("div.title").text("FAQs");
    $(".side_bar_help_console").show();
  });

  /* Keyboard Shortcuts */
  document.onkeyup = function (e) {
    //on click escape button exit side nav
    if (e.key == "Escape") {
      toggleSidePanel(false);
    }
  };

  $("#cancelAdd").click(function () {
    //reset tempMeal
    for (var prop in tempMeal) {
      tempMeal[prop] = undefined;
    }
    closeForm();
  });
  $("#cancelEdit").click(function () {
    closeEditForm();
  });
});

$(document).on("click", ".selectedOp", function () {
  $(document.getElementById("search_list")).toggle();
});

$(document).on("click", ".SearchOp", function () {
  //delete yelp autocomplete items on search type change
  $("#yelpAutocompleteItems").empty();
  clearInterval(window.yelpAutocompleteTimer);
  window.yelpAutocompleteTimer = undefined;

  // change the filter options
  if ($(this).text().toLowerCase() === "restaurants") {
    $(document.getElementById("filter")).show();
    $(document.getElementById("filter2")).hide();
  } else {
    $(document.getElementById("filter2")).show();
    $(document.getElementById("filter")).hide();
  }
  // replace the text in the search selection, hide the drop down(?)
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("search_list")).toggle();
  $(document.getElementById("search_sel")).html(txt);
});

// show the price filter drop down (price_list is is an <ul>)
$(document).on("click", ".selectedOp2", function () {
  $(document.getElementById("price_list")).toggle();
});

// hide the drop down and set the text to the
// selected drop down item text (SearchOp2 is a <li>)
$(document).on("click", ".SearchOp2", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("price_list")).toggle();
  $(document.getElementById("price_sel")).html(txt);
});

$(document).on("click", ".selectedOp3", function () {
  $(document.getElementById("range_list")).toggle();
});
$(document).on("click", ".SearchOp3", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("range_list")).toggle();
  $(document.getElementById("range_sel")).html(txt);
});

$(document).on("click", ".selectedOp4", function () {
  $(document.getElementById("sort_list")).toggle();
});
$(document).on("click", ".SearchOp4", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("sort_list")).toggle();
  $(document.getElementById("sort_sel")).html(txt);
});

$(document).on("click", ".selectedOp5", function () {
  $(document.getElementById("type_list")).toggle();
});
$(document).on("click", ".SearchOp5", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("type_list")).toggle();
  $(document.getElementById("type_sel")).html(txt);
});

$(document).on("click", ".selectedOp6", function () {
  $(document.getElementById("sortby_list")).toggle();
});
$(document).on("click", ".SearchOp6", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("sortby_list")).toggle();
  $(document.getElementById("sortby_sel")).html(txt);
});

$(document).on("click", ".selectedOp7", function () {
  $(document.getElementById("sort_direct_list")).toggle();
});
$(document).on("click", ".SearchOp7", function () {
  var txt = $(this).text();
  txt = "<p>" + txt + "</p>";
  $(document.getElementById("sort_direct_list")).toggle();
  $(document.getElementById("sort_direct_sel")).html(txt);
});

/* Call Search from Keyboard or Button Click */
$(document).on("keyup", ".search_bar", function (e) {
  if (e.keyCode == 13) {
    //if user presses enter
    handleSearch();
  } else if ($(".selectedOp p").text().toLowerCase() === "restaurants") {
    // After a user selects a autocomplete suggestion, modify the previously
    // stored value so they don't get a redundant autocomplete.
    if (
      $("#yelpAutocompleteItems")
        .children()
        .toArray()
        .some((item) => {
          return (
            item.innerHTML.toLowerCase() ===
            $(".search_bar").val().trim().toLowerCase()
          );
        })
    ) {
      $(".search_bar").attr("data-prevSearch", $(".search_bar").val());
      $("#yelpAutocompleteItems").empty();
    }
    handleYelpAutocomplete(false);
  }
});

$(".search_bar").on("input", () => {});

$(document).on("click", ".search_button", function () {
  handleSearch();
});

function handleSearch() {
  $(".display_pane").empty();
  if ($(".selectedOp p").text().toLowerCase() === "restaurants") {
    // Remove autocomplete datalist options
    $("#yelpAutocompleteItems").empty();
    // remove yelp autocomplete interval timer
    handleYelpAutocomplete(true); // delete == true

    var price = "1, 2, 3, 4";
    if ($(".selectedOp2 p").text() === "$") {
      price = "1";
    } else if ($(".selectedOp2 p").text() === "$$") {
      price = "2";
    } else if ($(".selectedOp2 p").text() === "$$$") {
      price = "3";
    } else if ($(".selectedOp2 p").text() === "$$$$") {
      price = "4";
    }
    var distance = 16000;
    if ($(".selectedOp3 p").text() === "1 Mile") {
      distance = "1600";
    } else if ($(".selectedOp3 p").text() === "2 Miles") {
      distance = "3200";
    } else if ($(".selectedOp3 p").text() === "5 Miles") {
      distance = "8000";
    } else if ($(".selectedOp3 p").text() === "20 Miles") {
      distance = "32000";
    }
    var sort = "best_match";
    if ($(".selectedOp4 p").text() === "Rating") {
      sort = "rating";
    } else if ($(".selectedOp4 p").text() === "Distance") {
      sort = "distance";
    }

    yelpQueryHandler(price, distance, sort);
  } else if ($(".selectedOp p").text().toLowerCase() === "recipes") {
    var type = "";
    if ($(".selectedOp5 p").text() === "Breakfast") {
      type = "breakfast";
    } else if ($(".selectedOp5 p").text() === "Main Course") {
      type = "main course";
    } else if ($(".selectedOp5 p").text() === "Side Dish") {
      type = "side course";
    } else if ($(".selectedOp5 p").text() === "Snack") {
      type = "snack";
    }
    var sortby = "popularity";
    if ($(".selectedOp6 p").text() === "Price") {
      sortby = "price";
    } else if ($(".selectedOp6 p").text() === "Healthiness") {
      sortby = "healthiness";
    }
    var sortdir = "desc";
    if ($(".selectedOp7 p").text() === "Ascending") {
      sortdir = "asc";
    } else if ($(".selectedOp7 p").text() === "Descending") {
      sortdir = "desc";
    }

    processSpoonacularCall(type, sortby, sortdir);
  }
}

function yelpQueryHandler(priceIn, distanceIn, sortIn) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((getPos) => {
      processYelpCall(getPos.coords, priceIn, distanceIn, sortIn);
    });
  } else {
    alert(
      "Geolocation is not supported by this browser. You may need to adjust your setting or update you permissions."
    );
    console.error("Geolocation is not supported by this browser.");
    return null;
  }
}

function processYelpCall(position, myPrice, myDistance, mySort) {
  $.ajax({
    type: "POST",
    url: "/queryYelpAPIrest",
    data: {
      query: $(".search_bar").val(),
      lat: position.latitude,
      long: position.longitude,
      price: myPrice,
      distance: myDistance,
      sort: mySort,
    },
    success: (data) => {
      let businesses = data.query.jsonBody.businesses;
      businesses = businesses.filter(business => window.blacklist.every(blacklistedItem => blacklistedItem.itemId !== business.id));
      let count = businesses.length;
      if (count == 0) {
        alert("No Results Found");
      }
      for (let i = 0; i < count - 1; i++) {
        //console.log(out.jsonBody.businesses[i])
        if(!blacklist.includes(businesses[i].id)){
        $(".display_pane").append(
          '<div id="' +
            businesses[i].id +
            '" class="card">' +
            '<div class="cardLeft"><img class="img_card" src="' +
            businesses[i].image_url +
            '"></img></div>' +
            '<div class="cardMiddle"><div class="RestaurantName"><p>' +
            businesses[i].name +
            '</p></div><div class="description"><p>' +
            businesses[i].categories[0].title +
            "<br>Price: " +
            businesses[i].price +
            "</p></div></div>" +
            '<div class="cardRight"><div class="top"></div><div class="bottom"></div></div>' +
            "</div>"
        );
        }
      }
    },
  });
}

function handleYelpAutocomplete(deleteTimeout) {
  if (window.yelpAutocompleteTimer === undefined) {
    $(".search_bar").attr("data-prevSearch", "");
    window.yelpAutocompleteTimer = setInterval(yelpAutocomplete, 2000);
  } else if (deleteTimeout) {
    clearInterval(window.yelpAutocompleteTimer);
    window.yelpAutocompleteTimer = undefined;
  }
}

function yelpAutocomplete() {
  // If the search has not changed, do not make the query
  let search = $(".search_bar").val().trim();
  if (search === $(".search_bar").attr("data-prevSearch").trim()) {
    // search term was the same as previous; dont make new query
    return;
  } else {
    $(".search_bar").attr("data-prevSearch", search);
  }
  $.ajax({
    type: "POST",
    url: "/queryYelpAPIAutocomplete",
    data: { incompleteSearch: search },
    success: (data) => {
      console.log(data.query.jsonBody.terms);
      // use data.jsonBody.terms[] aswell as
      $("#yelpAutocompleteItems").empty();
      data.query.jsonBody.terms.forEach((term) => {
        $("#yelpAutocompleteItems").append(
          "<option>" + term.text + "</option>"
        );
      });
    },
  });
}

function processSpoonacularCall(type, sortby, sortdir) {
  let q = $(".search_bar").val();
  $.ajax({
    url:
      "https://api.spoonacular.com/recipes/search?apiKey=a123019f01964a15814a171946a3533e&number=20&query=" +
      q +
      type +
      "&sort=" +
      sortby +
      "&sortDirection=" +
      sortdir,
    success: (data) => {
      let url = data.baseUri;
      let recipes = data.results;
      console.log(recipes);
      recipes = recipes.filter(recipe => window.blacklist.every(blacklistedItem => blacklistedItem.itemId !== recipe.id.toString()));
      console.log(recipes);
      let sz = recipes.length;
      if (sz == 0) {
        alert("No Results Found");
      }
      for (let i = 0; i < sz; i++) {
        let token = recipes[i];
        if(!blacklist.includes(token.id)){
        $(".display_pane").append(
          '<div class="card" id="' +
            token.id +
            '">' +
            '<div class="cardLeft"><img class="img_card" src="' +
            url +
            "/" +
            token.image +
            '"></img></div>' +
            '<div class="cardMiddle"><div class="RecipeName"><p>' +
            token.title +
            '</p></div><div class="description"><p> Servings: ' +
            token.servings +
            "<br>Ready in: " +
            token.readyInMinutes +
            "m</p></div></div>" +
            '<div class="cardRight"> <div class="top"></div><div class="bottom"></div> </div>' +
            "</div>"
        );
        }
      }
    },
  });
}

function printMealPlan() {
  //for each meal saved in window.mealPlan.[day],
  //print out the corresponding meal card
  for(day in weekMealPlan.MealPlan)
  {
    let dayObj = weekMealPlan.MealPlan[day];
    
    for(mealTime in dayObj)
    {
      let mealObj = dayObj[mealTime];
      console.log(mealObj)
      $(".meal_display").append(
        '<div class="mealCard" id = "' +
          day+'_'+mealObj.mealType+'_'+mealObj.id +
          '">' +
          '<div class="mealCardMiddle">' +
          '<div class="MealName"><p>' +
          mealObj.name +
          "</p></div>" +
          '<div class="description"><p>Calories: ' +
          mealObj.calories +
          " Price: " +
          mealObj.price +
          " For " +
          mealObj.mealType +
          "</p></div>" +
          "</div>" +
          '<div class="mealCardRight">' +
          '<div class="mealtop"></div>' +
          '<div class="mealbottom"></div>' +
          "</div>" +
          "</div>"
      );
    }
  }  
}

function resetCurrentlyViewing() {
  currentlyViewing.id = undefined;
  currentlyViewing.type = undefined;
  console.log(JSON.stringify(currentlyViewing)); //for debugging
}

$(document).on("click", ".card", function (e) {
  let id = e.currentTarget.id;
  currentlyViewing.id = id;
  $("#btnAdd").show();
  if ($(".selectedOp p").text().toLowerCase() === "restaurants") {
    currentlyViewing.type = "restaurant";
    $.ajax({
      type: "POST",
      url: "/queryYelpAPIBusiness",
      data: { identifier: id },
      success: (data) => {
        let out = data.query.jsonBody.url;
        $("#search_q_disp").attr("src", out);
      },
    });
  } else if ($(".selectedOp p").text().toLowerCase() === "recipes") {
    currentlyViewing.type = "recipe";
    $.ajax({
      url:
        "https://api.spoonacular.com/recipes/" +
        id +
        "/information?apiKey=a123019f01964a15814a171946a3533e&includeNutrition=true",
      success: (data) => {
        let out = data.sourceUrl;
        var _out = JSON.stringify(out);
        if (_out.includes("https://")) {
          //is secure
          $("#search_q_disp").attr("src", out);
        } else {
          alert(
            "If the page does not load, you may need to check your browser settings. See the Help Icon for more information"
          );
          $("#search_q_disp").attr("src", out);
        }
        console.log(data);
      },
    });
  }
  console.log(
    "Currently Viewing: " +
      JSON.stringify(currentlyViewing.id) +
      ", Type " +
      JSON.stringify(currentlyViewing.type)
  );
});

//click on FAVORITE button on card
$(document).on("click", ".top", function (e) {
  var addFavorite = confirm("Add to Favorites?");
  console.log(addFavorite);
  if (addFavorite == true) {
    let mealID = $(this).closest("div.card").attr("id");
    // make sure its not already in favorites
    if (window.favorites.some(item => mealID == item.itemId)) {
      return;
    }
    // remove from blacklist if it is blacklisted
    window.blacklist = window.blacklist.filter(item => item.itemId !== mealID);

    var api;
    if ($(".selectedOp p").text().toLowerCase() === "restaurants") {
      api = "yel";
    } else if ($(".selectedOp p").text().toLowerCase() === "recipes") {
      api = "spo";
    }
    //add to Favorites Table
    //server call
    $.ajax({
      type: "POST",
      url: "/addFavorite",
      data: {
        id: mealID,
        API: api,
      },
      success: (data) => {
        alert("Added to your favorites!");
      },
    });

    //local 
    let meal = {
      itemId: mealID,
      API: api
    }
    window.favorites.push(meal);
  }
});
//click on BLACKLIST button on card
$(document).on("click", ".bottom", function () {
  var addBlacklist = confirm("Would you like to Blacklist this item?");
  if (addBlacklist == true) {
    let mealID = $(this).closest("div.card").attr("id");
    var api;
    if ($(".selectedOp p").text().toLowerCase() === "restaurants") {
      api = "yel";
    } else if ($(".selectedOp p").text().toLowerCase() === "recipes") {
      api = "spo";
    }
    // make sure its not already in favorites
    if (window.blacklist.some(item => mealID == item.itemId)) {
      return;
    }
    // remove from blacklist if it is blacklisted
    window.favorites = window.favorites.filter(item => item.itemId !== mealID);
    //add to Blacklist Table
    //server call
    var meal = {
      id: mealID,
      API: api,
    };

    $.ajax({
      type: "POST",
      url: "/addBlacklist",
      data: meal,
      success: (data) => {
        alert("Added to your blacklist!");
      },
    });

    //local
    // cant reuse meal due to naming of "itemId"
    window.blacklist.push({
      itemId: mealID,
      API: api,
    });
  }
});



//CALCULATE CALORIES
function calcCal() {
  let cal = 0;
  for(day in weekMealPlan.MealPlan)
  {
    let dayObj = weekMealPlan.MealPlan[day]; 
    for(mealTime in dayObj)
    {
      let mealObj = dayObj[mealTime];
      cal+= Number(mealObj.calories);
    }
  }
  console.log(cal);
  return Math.round(cal);
}

//CALCULATE PRICE
function calcPrice() {
  let price = 0;
  for(day in weekMealPlan.MealPlan)
  {
    let dayObj = weekMealPlan.MealPlan[day]; 
    for(mealTime in dayObj)
    {
      let mealObj = dayObj[mealTime];
      price+= Number(mealObj.price);
    }
  }
  console.log(price)
  return  Number(price.toFixed(2));
}
//GET DAY NAME LONG
function mapShort(day)
{
  switch(day.toLowerCase())
  {
    case('mon'):
    return 'Monday';
    case('tue'):
    return 'Tuesday';
    case('wed'):
    return 'Wednesday';
    case('thur'):
    return 'Thursday';
    case('fri'):
    return 'Friday';
    case('sat'):
    return 'Saturday';
    case('sun'):
    return 'Sunday';
    default:
    return day.toLowerCase();
  }
}
//GET DAY NAME SHORT
function mapLong(day)
{
  switch(day.toLowerCase())
  {
    case('monday'):
    return 'Mon';
    case('tuesday'):
    return 'Tue';
    case('wednesday'):
    return 'Wed';
    case('thursday'):
    return 'Thu';
    case('friday'):
    return 'Fri';
    case('saturday'):
    return 'Sat';
    case('sunday'):
    return 'Sun';
    default:
    return day.toLowerCase()
  }
}
//IS VALID DAY OF WEEK
function isValid(day){
  if(day == 'mon' || day == 'tue' || day =='wed' || day == 'thu'|| day =='fri' || day == 'sat' || day== 'sun') return true;
  return false;
}
//insert meal element
function setMeal(day, mealtype, mealObj)
{
  if(!(day in weekMealPlan.MealPlan)) 
    weekMealPlan.MealPlan[day] = [];  
  if(!(mealtype in weekMealPlan.MealPlan[day])){
    weekMealPlan.MealPlan[day][mealtype] = [];
  }
  
  weekMealPlan.MealPlan[day][mealtype]= mealObj; 
  
}
//REMOVE MEAL
$(document).on("click", ".mealtop", function (e) {
  let mealPlanID = $(this).closest("div.mealCard").attr("id");
  var temp = String(mealPlanID).split("_");
  let day= temp[0]
  let tod = temp[1]
  delete weekMealPlan.MealPlan[day][tod];
  updatePage2();
});
//ADD MEAL-------------------------------------------
$(document).on("click", "#btnAdd", function () {
  //when user clicks the Add Meal Button at bottom
  //add meal to plan
  if (currentlyViewing.id == undefined || currentlyViewing.type == undefined) {
    //no id or type
    alert("Error. Cannot add meal");
  } else {
    //do what needs to be done to add to meal plan
    //set tempMeal id and type
    tempMeal.id = currentlyViewing.id;
    tempMeal.type = currentlyViewing.type;
    getMealInfo(currentlyViewing.id, currentlyViewing.type); //gets price and calores
    openForm(); //gets user info
  }
});
function getMealInfo(id, type) {
  //gets price, name and calories for restaurant and recipes
  //console.log(JSON.stringify(type) + ' '+ JSON.stringify(id));
  if (type == "restaurant") {
    //query for price range
    //save to info
    console.log("Querying for Restaurant Information");
    $.ajax({
      type: "POST",
      url: "/queryYelpAPIBusiness",
      data: {
        identifier: id,
      },
      success: (data) => {
        let out = data.query.jsonBody;
        console.log(out);
        tempMeal.calories = JSON.stringify(0); //restaurants are not included in calorie count
        tempMeal.name = out.name;
        let dollar_signs = out.price;
        console.log(dollar_signs);
        if (dollar_signs == undefined || dollar_signs == null) {
          tempMeal.price = JSON.stringify(0);
          console.log("price returned undefined or null");
        } else if (dollar_signs == "$") {
          tempMeal.price = JSON.stringify(10);
        } else if (dollar_signs == "$$") {
          tempMeal.price = JSON.stringify(30);
        } else if (dollar_signs == "$$$") {
          tempMeal.price = JSON.stringify(60);
        } else if (dollar_signs == "$$$$") {
          tempMeal.price = JSON.stringify(100);
        } else {
          tempMeal.price = JSON.stringify(0);
          console.log("Cannot be read");
        }
      },
    });
  } else if (type == "recipe") {
    //query for calories and price
    //save to info
    console.log("Querying for Recipe Information");

    $.ajax({
      url:
        "https://api.spoonacular.com/recipes/" +
        id +
        "/information?apiKey=a123019f01964a15814a171946a3533e&includeNutrition=true",
      success: (data) => {
        tempMeal.name = data.title;
        tempMeal.calories = JSON.stringify(data.nutrition.nutrients[0].amount); //colories
        var price = Number(data.pricePerServing) / 100;
        tempMeal.price = JSON.stringify(price);
        console.log("TempMeal So Far: ");
        console.log(tempMeal);
        console.log("Query Recipe Result: ");
        console.log(data);
      },
    });
  } else {
    console.log("Meal Type Not Found or Incorrect");
  }
}
function openForm() {
  $("#myForm").show();
}
function closeForm() {
  $("#myForm").hide();
  //reset tempMeal
  for (var prop in tempMeal) {
    tempMeal[prop] = undefined;
  }
}
function getFormInfo() {
  //sets tempMeal mealType and dayOfWeek
  tempMeal.mealType = $("#popup_meal_type").val();
  tempMeal.dayOfWeek = $("#popup_day").val();
}
$(document).on("click", "#addMeal", function () {
  //when user clicks Add Meal Button in pop up form
  getFormInfo();
  let meal = {
    id: tempMeal.id,
    type: tempMeal.type,
    name: tempMeal.name,
    price: tempMeal.price,
    calories: tempMeal.calories,
    day: tempMeal.dayOfWeek,
    mealType: tempMeal.mealType,
  };
  var day = mapLong(meal.day).toLowerCase();
  if(isValid(day))
  {  
    setMeal(day,meal.mealType,meal);
    alert("Meal Added");
    printMealPlan();
    closeForm();

  }
  else 
  {
    alert("invalid day selected: valid days are [monday , tuesday, wednesday, thursday, friday, saturday, sunday]<case insensitive>");
  }


  var curr = new Date();
  var nextday = new Date();

  var dayofweek = 0;
  switch (meal.day) {
      case "Monday":
          dayofweek = 1;
          break;
      case "Tuesday":
          dayofweek = 2;
          break;
      case "Wednesday":
          dayofweek = 3;
          break;
      case "Thursday":
          dayofweek = 4;
          break;
      case "Friday":
          dayofweek = 5;
          break;
      case "Saturday":
          dayofweek = 6;
          break;
      case "Sunday":
          dayofweek = 0;
          break;
  }
    //from codereview.stackexchange.com/questions/33527/find-next-occurring-friday-or-any-dayofweek
  function getNextDayOfWeek(date, dayOfWeek) {
      var resultDate = new Date(date.getTime());
      resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
      return resultDate;
  }
  nextday = getNextDayOfWeek(curr, dayofweek);
    //only works for Jan through Sept, cause 04=april vs 4=april, and doesn't change time based on meal.type yet 
  var day = nextday.getFullYear() + '-0' + (nextday.getMonth() + 1) + '-' + nextday.getDate() + "T15:30:00Z";
  var dayend = nextday.getFullYear() + '-0' + (nextday.getMonth() + 1) + '-' + nextday.getDate() + "T17:30:00Z";
  $.ajax({
      type: "GET",
      url: "/sendToCal",
      data: {
          cal: localStorage["id"],
          access: localStorage["access"],
          title: meal.name,
          id: (meal.id + nextday.getDate()),
          start: day,
          end: dayend
      }
  });
});

//----------------------------------------------------

//Edit Meal-------------------------------------------
$(document).on("click", ".mealbottom", function (e) {
  let mealPlanID = $(this).closest("div.mealCard").attr("id");
  console.log(mealPlanID);
  var temp = String(mealPlanID).split("_");
  var day = temp[0];
  var tod = temp[1];
  
  editMealPlan =JSON.parse(JSON.stringify(weekMealPlan.MealPlan[day][tod]));
  $("#myFormEdit").show();
  $("#popup_meal_type_edit").val(tod);
  $("#popup_day_edit").val(mapShort(day));
});

$(document).on("click", "#editMeal", function () {
  var mtype =  $("#popup_meal_type_edit").val().toLowerCase();
  var mday = $("#popup_day_edit").val().toLowerCase();
  var origDay = mapLong( editMealPlan.day).toLowerCase();
  var origTod = editMealPlan.mealType.toLowerCase();
  console.log(mtype,mday)
  console.log(origDay,origTod)
  if(typeof mtype !== undefined && typeof mday !== undefined)
  {
    var day = mapLong(mday).toLowerCase();
    if(isValid(day))
    {
      delete weekMealPlan.MealPlan[origDay][origTod];
      editMealPlan.mealType = mtype;
      editMealPlan.day = mday;
      setMeal(day,mtype,editMealPlan);
      closeEditForm();
      updatePage2();
    }
      
  }
  else{
    alert("Please make sure you filled out the entire form.");
  }
});
function closeEditForm() {
  editMealPlan = []
  $("#myFormEdit").hide();
}
//------------------------------------------------------

function updatePage() {
  calorieIntake = $("#updatecal").val() || 0;
  weeklyBudget = $("#updatebudget").val() || 0;
  $("#calories").find("#c_val").remove();
  $("#budget").find("#b_val").remove();
  $("#calories").append(
    '<p id ="c_val" style="display: inline-block;">' + calorieIntake + "</p>"
  );
  $("#budget").append(
    '<p id ="b_val" style="display: inline-block;">' + weeklyBudget + "</p>"
  );
}
function updatePage2()
{
  $(".meal_display").empty();
  printMealPlan();
  $.ajax({
    type: "POST",
    url: "/saveLocalMeal",
    data: weekMealPlan.MealPlan,
    cache: false,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: (data) => {
      console.log("Meal Plan Saved");
    },
  });
}
/*

function retrieveSessionMeal() {
  $.ajax({
    type: "POST",
    url: "/retrieveSessionMeal",
    data: {},
    success: (data) => {
      console.log(data);
      mealPlan = data.mealPlan;
    },
  });
}
*/

//temporary implementation until ajax call works
function printFavorites(){
  console.log("Querying favorites");
  if (window.favorites.length == 0) {
    alert("You have no favorited items, go to search and add some!")
    return;
  }
  for(let i = 0; i < window.favorites.length; i++){
      let token = window.favorites[i];
      let type = token.API;
      if (type == "yel") {
        //restaurant
        $.ajax({
          type: "POST",
          url: "/queryYelpAPIBusiness",
          data: {
            identifier: token.itemId,
          },
          success: (data_yel) => {
            let out = data_yel.query;
              $(".favorites_display").append(
                '<div id="' +
                  out.jsonBody.id +
                  '" class="card">' +
                  '<div class="cardLeft"><img class="img_card" src="' +
                  out.jsonBody.image_url +
                  '"></img></div>' +
                  '<div class="cardMiddle"><div class="RestaurantName"><p>' +
                  out.jsonBody.name +
                  '</p></div><div class="description"><p>' +
                  out.jsonBody.categories[0].title +
                  "<br>Price: " +
                  out.jsonBody.price +
                  "</p></div></div>" +
                  '<div class="cardRight"><div class="favoritestop"></div></div>' +
                  "</div>"
              );
          },
        });
      } else if (type === "spo") {
        //recipe
        console.log("Querying for Recipe Information");
        $.ajax({
          url:
            "https://api.spoonacular.com/recipes/" +
            token.itemId +
            "/information?apiKey=a123019f01964a15814a171946a3533e&includeNutrition=false",
          success: (data_spo) => {
            let recipe = data_spo;
            $(".favorites_display").append(
              '<div class="card" id="' +
                recipe.id +
                '">' +
                '<div class="cardLeft"><img class="img_card" src="' +
                recipe.image +
                '"></img></div>' +
                '<div class="cardMiddle"><div class="RecipeName"><p>' +
                recipe.title +
                '</p></div><div class="description"><p> Servings: ' +
                recipe.servings +
                "<br>Ready in: " +
                recipe.readyInMinutes +
                "m</p></div></div>" +
                '<div class="cardRight"><div class="favoritestop"></div></div>' +
                "</div>"
            );
          },
        });
      }
  }
}

function printBlacklist() {
  console.log("Querying blacklist");

  if (window.blacklist.length == 0) {
    alert("Your Blacklist is empty!")
    return;
  }
  for(let i = 0; i < window.blacklist.length; i++){
    let token = window.blacklist[i];
    let type = token.API;
    if (type == "yel") {
      //restaurant
      $.ajax({
        type: "POST",
        url: "/queryYelpAPIBusiness",
        data: {
          identifier: token.itemId,
        },
        success: (data_yel) => {
          let out = data_yel.query;
            $(".blacklist_display").append( 
              '<div id="' +
                out.jsonBody.id +
                '" class="card">' +
                '<div class="cardLeft"><img class="img_card" src="' +
                out.jsonBody.image_url +
                '"></img></div>' +
                '<div class="cardMiddle"><div class="RestaurantName"><p>' +
                out.jsonBody.name +
                '</p></div><div class="description"><p>' +
                out.jsonBody.categories[0].title +
                "<br>Price: " +
                out.jsonBody.price +
                "</p></div></div>" +
                '<div class="cardRight"><div class="blackliststop"></div></div>' +
                "</div>"
            );
        },
        failure: (err) => {
          console.log("unable to retreive yelp business item for blacklist");
          console.log(err)
        }
      });
    } else if (type === "spo") {
      //recipe
      console.log("Querying for Recipe Information");
      $.ajax({
        url:
          "https://api.spoonacular.com/recipes/" +
          token.itemId +
          "/information?apiKey=a123019f01964a15814a171946a3533e&includeNutrition=false",
        success: (data_spo) => {
          let recipe = data_spo;
          $(".blacklist_display").append( 
            '<div class="card" id="' +
              recipe.id +
              '">' +
              '<div class="cardLeft"><img class="img_card" src="' +
              recipe.image +
              '"></img></div>' +
              '<div class="cardMiddle"><div class="RecipeName"><p>' +
              recipe.title +
              '</p></div><div class="description"><p> Servings: ' +
              recipe.servings +
              "<br>Ready in: " +
              recipe.readyInMinutes +
              "m</p></div></div>" +
              '<div class="cardRight"><div class="blackliststop"></div></div>' + 
              "</div>"
          );
        },
        failure: (err) => {
          console.log("unable to retreive spoonacular item for blacklist");
          console.log(err)
        }
      });
    }
  }
}

function retrieveFavoritesList() {
  $.ajax({
    type: "POST",
    url: "/getFavorites",
    data: {},
    success: (data) => {
      data.result.forEach((item) => {
        window.favorites.push({...item})
      })
    },
    failure: (err) => {
      console.log("unable to retreive favorites");
      console.log(err)
    }
  });
}

function retrieveBlacklist(){
  $.ajax({
    type: "POST",
    url: "/getBlacklist",
    data: {},
    success: (data) => {
      data.result.forEach((item) => {
        window.blacklist.push({...item});
      });
    },
    failure: (err) => {
      console.log("unable to retreive blacklist");
      console.log(err)
    }
  });
}

function removeFromFavorites() {

}

function removeFromBlacklist() {

}
