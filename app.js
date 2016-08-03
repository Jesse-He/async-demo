var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var async = require('async');

var concurrencyCount = 0;
var fetchUrl = function (url, callback) {
  var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  concurrencyCount++;
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是',  url + ' successful');
  setTimeout(function () {
    concurrencyCount--;
    superagent.get(url).end(function (err, res) {
      var $ = cheerio.load(res.text);
      var topic ={
        title: $('.topic_full_title').text().trim(),
        href: url,
        comment1: $('.reply_content').eq(0).text().trim(),
      };
      // console.log(topic);
      callback(null, topic);
    });

  }, delay);
};


var cnodeUrl = 'https://cnodejs.org/';
superagent.get(cnodeUrl)
.end(function (err, res) {
  if (err) {
    return console.error(err);
  }
  var topicUrls = [];
  var $ = cheerio.load(res.text);
    // 获取首页所有的链接
    $('#topic_list .topic_title').each(function (idx, element) {
      var $element = $(element);
      // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
      // 我们用 url.resolve 来自动推断出完整 url，变成
      // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
      // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      topicUrls.push(href);
    });
    async.mapLimit(topicUrls, 5, function (url, callback) {
      fetchUrl(url, callback);
    }, function (err, result) {
      console.log('final:');
      console.log(result);
    });
  });
