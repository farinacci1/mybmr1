

$(document).ready(function () {
    var codes = "";
    var access = "";
    if (window.location.search) {
        var urlsplit = window.location.search.split('=')[1];
        codes = urlsplit.split('&')[0];
    }
    console.log(codes);
    var element = "";
        $.ajax({
            type: "GET",
            url: "/authCal",
             data: {code:codes},
            success: (data) => {
                element = data.token;
                console.log("token=" + element)
                //data.access and data.cal need to be stored somewhere and retrieved by home.js when for GET /sendToCal
                console.log("access=" + data.access)
                console.log("id=" + data.cal)
                localStorage["access"] = data.access;
                localStorage["id"] = data.cal;
                if (window.location.search) {
                    window.location.href = "https://bmr-app.herokuapp.com/home.html";
                }

                $(document.getElementById("cronofy-calendar-sync").append(CronofyElements.CalendarSync({
                     element_token: element,
                     target_id: "cronofy-calendar-sync",
                     authorization: {
                         redirect_uri: "https://bmr-app.herokuapp.com/index2.html/",
                         client_id: "hiPqunZWDaKQR2tBWEMUmhL18bLrnf75",
                         scope: "read_write"
                     },
                     styles: {
                         prefix: "CalendarSync"
                     }
                 })));
            }
        });





});


