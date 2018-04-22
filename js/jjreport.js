 Number.prototype.format = function() {
     if (this == 0) {
         return 0;
     }

     let $regex = /(^[+-]?\d+)(\d{3})/;
     let $num = this + '';

     while ($regex.test($num)) {
         $num = $num.replace($regex, '$1' + ',' + '$2');
     }

     return $num;
 }

 let $sMessageWarning = '';
 let $sMessageWarningHeader = '';

 let filteredData = new Object();
 let authors = [];
 let totalPostCount = 0;
 let totalVotes = 0;

 let startDate;
 let endDate;
 let period;

 let MAX = 100;
 // if debugmode, MAX = 1 if not, 100. 

 let recur_t = 0;

 let postPerHour;
 let postPerDay;

 let sizeOneChart = 860;

 $(document).ready(function() {;
 });

 function initPage() {
     $sMessageWarning = $("#message_warning");
     $sMessageWarningHeader = $("#message_warning_header");

     if (isMobileOrTablet()) {
         sizeOneChart = 290;
     }
 }

 function refreshPage() {
     filteredData = new Object();
     authors = [];
     totalPostCount = 0;
     totalVotes = 0;
     postPerHour = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0
     ];
     postPerDay = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0
     ];
     recur_t = 0;
 }

 // https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination
 function loadDiscussions(days) {
     refreshPage();

     period = days;

     $("#wrap_loader").addClass('active');

     steem.api.getDiscussionsByCreated({
             "tag": "jjangjjangman",
             "limit": MAX
         },
         (err, result) => {
             if (err) {
                 console.log(err);
             } else {
                 endDate = new Date(result[0].created);

                 makeDataForTable(result, 0);

                 recursiveLoading(result[MAX - 1].permlink, result[MAX - 1].author);
             }
         });
 }

 function recursiveLoading(lastPermlink, lastAuthor) {

     steem.api.getDiscussionsByCreated({
             "tag": "jjangjjangman",
             "limit": MAX,
             "start_permlink": lastPermlink,
             "start_author": lastAuthor
         },
         (err, result) => {
             if (err) {
                 console.log(err);
             } else {
                 makeDataForTable(result, 1);

                 let len = result.length - 1;

                 startDate = new Date(result[len].created);
                 let targetDate = new Date(endDate - (period * 24 * 60 * 60 * 1000));
                 let createdDate = new Date(result[len].created);
                 /*
                  * len : last part is less then 100.
                  * recur_t : load t * 100 items. variable value for developer.
                  */
                 if (createdDate < targetDate ||
                     len < 99 ||
                     recur_t > 40) {
                     setStatistics();
                     setTable();
                     drawChart();
                 } else {
                     recur_t++;
                     recursiveLoading(result[len].permlink, result[len].author);
                 }
             }
         });
 }

 function drawChart() {
     let arrPPH = ["시간 별 포스팅 수"];
     let arrPPH_MAX = 0;

     if (postPerHour == null || postPerHour.length < 1) {
         return;
     }

     for (let i = 0; i < 24; i++) {
         arrPPH.push(postPerHour[23 - i]);
         if (arrPPH_MAX < postPerHour[23 - i]) {
             arrPPH_MAX = postPerHour[23 - i] + 10;
         }
     }

     let chartPostPerHours = bb.generate({
         size: {
             height: 350,
             width: sizeOneChart
         },
         data: {
             columns: [arrPPH],
             type: "bar"
         },
         bar: {
             width: {
                 ratio: 0.7
             }
         },
         axis: {
             x: {
                 type: "category",
                 label: "( x시간 전 )",
                 categories: ["24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14",
                     "13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"
                 ]
             },
             y: {
                 label: "( 포스팅 수 )",
                 max: arrPPH_MAX,
                 min: 0
             }
         },

         bindto: "#areaChartPostPerHour"
     });
 }

 function setStatistics() {
     $("#userCount").text(authors.length);
     $("#postCount").text(totalPostCount);
     $("#totalVotesCount").text(totalVotes);
 }

 function setTable() {

     let tagUsersTableHeader =
         `<thead>
            <tr>
                <th class="center aligned">
                    사용자
                </th>
                <th class="center aligned">
                    태그 사용 글 수
                </th>
                <th class="center aligned">
                    짧은 글 수 (30글자 이하)
                </th>
                <th class="center aligned">
                    한글 사용 여부
                </th>
                <th class="center aligned">
                    짱짱맨 보팅 수
                </th>
            </tr>
        </thead>`
     $("#tag_users_table").empty();
     $("#tag_users_table").append(tagUsersTableHeader);

     authors.forEach(user => {
         if (filteredData[user].count < period + 2 &&
             filteredData[user].short_len_count == 0 &&
             filteredData[user].is_hangul == 'O') {;
         } else {
             let template =
                 `<tr>
                    <td><a href="https://steemit.com/@${filteredData[user].author}" target="_blank">@${filteredData[user].author}</a></td>
                    <td class="right aligned">${filteredData[user].count}</td>
                    <td class="right aligned">${filteredData[user].short_len_count}</td>
                    <td class="right aligned">${filteredData[user].is_hangul}</td>
                    <td class="right aligned">${filteredData[user].voted}</td>
                </tr>`
             // <td class="right aligned">${((filteredData[user].vote_rshares)/1000000).toFixed(0)}</td>
             $("#tag_users_table").append(template);
         }
     });

     $("#statistic_info_title").text("사용 기간 내 정보 [ " + getTimeToPrint(startDate) + " ~ " + getTimeToPrint(endDate) + " ]");

     $("#wrap_loader").removeClass('active');
 }

 function getTimeToPrint(t) {
     let ret = new Date(t.valueOf() + (18 * 60 * 60 * 1000));
     ret = ret.toISOString().replace('T', ' ');
     ret = ret.substr(0, ret.length - 5);

     return ret;
 }

 function makeDataForTable(posts, start) {
     for (let i = start; i < posts.length; i++) {
         if (authors.indexOf(posts[i].author) == -1) {
             authors.push(posts[i].author);

             filteredData[posts[i].author] = {
                 "author": posts[i].author,
                 "count": 1,
                 "short_len_count": 0,
                 "vote_rshares": posts[i].vote_rshares,
                 "reputation": posts[i].author_reputation,
                 "is_hangul": isHangul(posts[i].body),
                 "voted": 0
             };
         } else {
             filteredData[posts[i].author].count++;
             filteredData[posts[i].author].posts_rshares += posts[i].vote_rshares;
         }

         totalPostCount++; // for statistics

         if (posts[i].active_votes.length > 0) {
             for (let j = 0; j < posts[i].active_votes.length; j++) {
                 if (posts[i].active_votes[j].voter == "virus707") {
                     filteredData[posts[i].author].voted += 1;
                     totalVotes += 1; // for statistics
                 }
             }
         }

         if (posts[i].body.length < 30) {
             filteredData[posts[i].author].short_len_count++;
         }

         if (period == 1) {
             let timeDiff = parseInt((endDate.getTime() - (new Date(posts[i].created)).getTime()) / 3600000);
             postPerHour[timeDiff] += 1;

         } else if (period == 7) {

         }

     }
 }

 function getTimeDiff(createdTime) {
     let diff = endDate.getTime() - createdTime.getTime();

     return parseInt(diff / 3600000);
 }

 /**
  * Check the device is mobile or not.
  *
  * @return true (mobile or tablet) or false (PC)
  **/
 // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 function isMobileOrTablet() {
     let check = false;
     (function(a) {
         if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
             check = true;
     })(navigator.userAgent || navigator.vendor || window.opera);
     return check;
 };

 function isHangul(phrase) {
     let regExp = /[ㄱ-힣]/g;
     if (phrase.match(regExp) != null) {
         return "O";
     }
     return "X";
 }

 let jjList = ["@virus707", "@isaaclab", "@jungs", "@abyu",
     "@akuku", "@anne.sophie", "@apion45", "@blaire0323",
     "@boostyou", "@burning", "@charliekim", "@choihaed",
     "@ckhwan", "@coininformation", "@cryptoabba", "@delphic",
     "@dronefly", "@dugsu2", "@ellenalee", "@essai",
     "@eunhaesarang", "@eunstar", "@eunyx", "@flightsimulator",
     "@forealife", "@gaogaiga13 @genius0110", "@gold2020",
     "@grapher", "@gudrn6677", "@hackerzizon", "@hahaheehee",
     "@haotien", "@happyjung", "@happylazar", "@hegel",
     "@honna", "@houstonian @hsuhouse0907", "@hunsour98",
     "@imddu", "@jaywon", "@jd8578", "@jiuun",
     "@jjjjabe", "@joons", "@jwnee79", "@jyoungking2",
     "@kardus", "@kidnss", "@kimegggg", "@kimpaulie",
     "@kingkim", "@knight4sky", "@koreaminer", "@kosun",
     "@kr-issue", "@kundani", "@kyjung9705", "@ldsklee",
     "@limchung2", "@lovelylee", "@maikuraki", "@mingee",
     "@minifam", "@minseungchoi", "@mircokim22", "@mjelf4835",
     "@mongsul", "@moont0", "@naha", "@nahollo",
     "@Newiz", "@nomader", "@oiool", "@omani02",
     "@parksangho", "@paxnet", "@qhfkdkfl", "@recode",
     "@recrack", "@risingsunz", "@ryanhkr", "@ryh0505",
     "@samkims", "@sense0w0", "@seojinpark", "@startfromnow",
     "@steemitst", "@sudal01", "@suin", "@sunhyeonsu",
     "@suran", "@tkdgjs79", "@upendown", "@wanderingship",
     "@whdgurclzls", "@williampark", "@winnie98", "@xiian",
     "@yangwoocheol", "@yani98 @yjc638", "@youngbeen",
     "@ysju1201", "@yuky", "@yusulism", "@yyromkim",
     "@zorba", "@zzings"
 ]