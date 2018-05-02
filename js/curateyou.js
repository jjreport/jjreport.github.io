let vList = [];
let fData = [];

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

let startDate;
let endDate;
let period = 2; // 3 days

let MAX = 100;
// if debugmode, MAX = 1 if not, 100. 

let recur_t = 0;

let targetTime;

$(document).ready(function() {;
});

let rewardBalance = 0;
let recentClaims = 0;
let basePrice = 0;

function initPage() {
    $sMessageWarning = $("#message_warning");
    $sMessageWarningHeader = $("#message_warning_header");

    vList = [
        "abangace99",
        "abdsamadsakhi", 
        "abg", 
        "abhbarry", 
        "abubukir", 
        "acehsteem", 
        "adyyong", 
        "afortunada", 
        "air-factory", 
        "aldianto", 
        "aliwali", 
        "anaita94", 
        "anoni22", 
        "anonimox", 
        "ansony", 
        "arumamami", 
        "asizio", 
        "askha", 
        "autovote", 
        "ayukarl", 
        "balia", 
        "bangis23", 
        "baridin", 
        "bbana", 
        "betesda", 
        "blackpace", 
        "bluetahiti", 
        "burung21", 
        "caromedina", 
        "chancho", 
        "chosigageo", 
        "dead-line", 
        "dorian-lee", 
        "electrogordo", 
        "ellenalee", 
        "erenai", 
        "eunheeha", 
        "fhool", 
        "flowerquen", 
        "frozi", 
        "gabrielsaldivia1", 
        "gentecomun", 
        "gentlefaker", 
        "godatsteem", 
        "goodcontent4u", 
        "gracee99", 
        "gteeting80", 
        "haiza", 
        "hantu", 
        "happycoachmate", 
        "har99", 
        "haraza", 
        "hendrimyz", 
        "heonbros", 
        "hobbits84", 
        "homkeuh99", 
        "honoo", 
        "hr02", 
        "htliau", 
        "hyeheyhye", 
        "hyunny", 
        "ibobbymari", 
        "idegbe007", 
        "ihsan19", 
        "jaeyeong", 
        "j-data", 
        "jhonshon", 
        "jungjunghoon", 
        "kanisuka", 
        "kimcharming", 
        "konan", 
        "kooniekoons", 
        "krwhale", 
        "laffle", 
        "lenovo8", 
        "lizasteem87", 
        "luash", 
        "maikuraki", 
        "majordon", 
        "malex30", 
        "manjeles", 
        "marcelof", 
        "mhd-balia07", 
        "mifta23", 
        "mih99", 
        "miyardibarnura", 
        "miyardie", 
        "mjg7822", 
        "mototeng", 
        "muhammad-adjibar", 
        "mullia", 
        "mymif23", 
        "newphilos", 
        "nitagina", 
        "oldgold90", 
        "palos", 
        "patli10", 
        "prostmomoter", 
        "pyamia82", 
        "qjrqkf", 
        "rahmadani19", 
        "realsunny", 
        "riverbrane", 
        "rizallipoo", 
        "saena", 
        "sakhisamid", 
        "semi23", 
        "shong2",
        "sky2sky", 
        "smartcome", 
        "son7", 
        "steamsteem", 
        "steemmif", 
        "steeps", 
        "sujisyndrome", 
        "sy", 
        "syeinoi", 
        "tizianotiziana", 
        "tkfloridagolf", 
        "udin99", 
        "vanessa2015", 
        "vnzlasteemit", 
        "waxherman", 
        "winnie98", 
        "withme", 
        "xtreme2015", 
        "zoelsteem"
        ];
}

function refreshPage() {
    filteredData = new Object();

    recur_t = 0;
}

function loadDiscussions() {
    refreshPage();

    $("#wrap_loader").addClass('active');

    // https://steemit.com/kr/@tradingideas/node-js-3
    steem.api.getRewardFund("post", function(err, rewardFund) {
        rewardBalance = parseFloat(rewardFund.reward_balance.split(' '));
        recentClaims = parseInt(rewardFund.recent_claims);

        steem.api.getCurrentMedianHistoryPrice(function(err, historyPrice) {
            basePrice = parseFloat(historyPrice.base.split(' ')) / parseFloat(historyPrice.quote.split(' ')); // feed_price


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

        });
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
                    setTable();
                } else {
                    recur_t++;
                    recursiveLoading(result[len].permlink, result[len].author);
                }
            }
        });
}

function setTable() {
    let tableHeader =
        `<thead>
            <tr>
                <th class="center aligned">
                    작성자
                </th>
                <th class="center aligned">
                    글
                </th>
                <th class="center aligned">
                    작성시간
                </th>
                <th class="center aligned">
                    보상
                </th>
            </tr>
        </thead>`
    $("#need_to_curation_table").empty();
    $("#need_to_curation_table").append(tableHeader);

    fData.forEach(post => {
        let convertedTime = getTimeToPrint(post.created);
        let template =
            `<tr>
                <td><a href="https://steemit.com/@${post.author}" target="_blank">@${post.author} (${post.reputation})</a></td>
                <td><a href="https://steemit.com${post.url}" target="_blank">${post.title}</a></td>
                <td class="center aligned">${convertedTime}</td>
                <td class="right aligned">${post.estSBD}</td>
            </tr>`
        // <td class="right aligned">${((filteredData[user].vote_rshares)/1000000).toFixed(0)}</td>
        $("#need_to_curation_table").append(template);
    });

    $("#wrap_loader").removeClass('active');
}

function getTimeToPrint(t) {
    let dateK = new Date(t);
    let ret = new Date(dateK.valueOf() + (18 * 60 * 60 * 1000));
    ret = ret.toISOString().replace('T', '<br />');
    ret = ret.substr(0, ret.length - 5);

    return ret;
}

function makeDataForTable(posts, start) {
    for (let i = start; i < posts.length; i++) {

        let rep = calcReputation(posts[i].author_reputation);
        let estSBD = getSBDfromRshares(posts[i].vote_rshares);
        if (posts[i].allow_votes &&
            rep <= 55 &&
            isInTime(posts[i].created) &&
            estSBD < 1 &&
            vList.indexOf(posts[i].author) == -1
        ) {

            fData.push({
                "author": posts[i].author,
                "estSBD": estSBD,
                "reputation": rep,
                "created": posts[i].created,
                "url": posts[i].url,
                "title": posts[i].title
            });
        }
    }

}

// https://steemit.com/steemit/@digitalnotvir/how-reputation-scores-are-calculated-the-details-explained-with-simple-math
function calcReputation(rep) {
    var ret = Math.log(rep) / Math.log(10); // same as 'Math.log10(rep) [I.E. doesn't support Math.log10]
    if (isNaN(ret)) {
        ret = 0;
    }
    ret = Math.max(ret - 9, 0);
    ret = Math.abs(ret) * 9 + 25

    return parseInt(ret);
}

/**
 * @param: created - created time
 * @return: Is written longer than 3 hours.
 */
function isInTime(created) {
    let now = new Date();
    let createdTime = new Date(created);
    let krCreatedTime = new Date(createdTime.getTime() + (9 * 60 * 60 * 1000));
    let target = new Date(now.getTime() - (3 * 60 * 60 * 1000));

    return target > krCreatedTime;
}

function getSBDfromRshares(rshares) {
    return ((rewardBalance / recentClaims) * basePrice * rshares).toFixed(2);
}