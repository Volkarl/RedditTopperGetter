
function createHtml(pushshiftUrl, subreddit, toEpoch, fromEpoch) {
	htmlChildren = undefined;
	return createHtmlContent(pushshiftUrl).then(html => htmlChildren === undefined 
		? HtmlBody(HtmlPageTitle(subreddit) + HtmlTimeSpan(toEpoch, fromEpoch) + HtmlPostTitle("No results found"))
		: HtmlBody(HtmlPageTitle(subreddit) + HtmlTimeSpan(toEpoch, fromEpoch) + htmlChildren));
	// Analyse json and create HTML string with all images, pictures, videos, etc.
}

var postCounter = 0;

function createHtmlContent(pushshiftUrl) {
	const addToString = post => {

		console.log(post);

		var extension = post.img.substring(post.img.lastIndexOf('.') + 1, post.img.length).toString(); 
		/////////////// This works, but a good regex would be better, because it chops up gfycat links, etc. too

		var element = HtmlDiv(HtmlLink(post.img, "Source URL"));

		// Is it an image (or some gifs)?
		if(extension === "jpg" || extension === "png" || extension === "gif")
			element = HtmlImage(post.img);

		// Is it an imgur album?
		else if(post.img.includes("imgur.com/a")) {
			element = HtmlImgurAlbum(post.img);
		}

		// Is it a gfycat?
		else if(post.img.includes("gfycat"))
			element = HtmlGfycat(post.img);

		// Is it a Giphy?
		else if(post.domain.includes("giphy"))
			element = HtmlGiphy(post.img);

		// Is it a gif?
		else if(extension === "gifv" || extension === "mp4")
			element = HtmlMp4(post.img.toString().slice(0, - (extension.length)) + "mp4");
			// Many .gif extensions could be used here too (imgur links, for one), however, some hosts cannot, as it would then point to a file that does not exist

		// Is it a picture without extension?
		else if (post.domain.includes("imgur.com") || post.domain.includes("i.redd.it"))
			element = HtmlImageWithoutExtension(post.img);

		// Is it a youtube video?
		else if(post.domain.includes("youtube") || post.domain.includes("youtu.be"))
			element = HtmlYoutube(post.img);

		else if(post.domain.includes("pornhub"))
			element = HtmlPorhub(post.img);

		else if(post.domain.includes("redtube"))
			element = HtmlRedtube(post.img);

		else if(post.domain.includes("youporn"))
					element = HtmlYouporn(post.img);

		else if(post.domain.includes("xvideos"))
					element = HtmlXvideos(post.img);

		else if(post.domain.includes("xhamster"))
					element = HtmlXhamster(post.img);

		// Is it reddit video?
		else if (post.domain.includes("v.redd.it"))
			element = "Reddit Video: Cannot Embed"; // Literally impossible without inline script

		else if(post.domain.includes("twitter"))
			element = HtmlTwitter(post.img);

		// Is it a dailymotion video?
		else if(post.domain.includes("dailymotion"))
			element = HtmlDailymotion(post.img);

		// Is it a self post?
		else if(post.is_self)
			element = HtmlSelfPost();

		// Is it none of the above?
		else 
			element = HtmlPostTitle("Unrecognized source URL");

		///// I feel like post.img should be renamed

		var html = HtmlDiv(HtmlPostTitle(`${postCounter++} ${post.title}`) + HtmlLineBreak() + element + HtmlComments(post.comments, post.num_comments) + HtmlLineDivider());

		console.log(html);

		htmlChildren === undefined ? htmlChildren = html : htmlChildren += html;

	  	return post
	  }

//https://api.pushshift.io/reddit/submission/search/?subreddit=doujinshi&after=1532345148&before=1532355327&sort_type=num_comments&sort=desc&size=50
	return fetch(pushshiftUrl) //////Todo
	  .then(res => res.json())
	  .then(res => res.data)
	  .then(res => res.map(post => ({img: post.url, comments: post.full_link, num_comments: post.num_comments, domain: post.domain, title: post.title, is_self: post.is_self})))
	  .then(res => res.map(addToString));
//	  .then(res => console.log(res)); //cant have this, otherwise it returns shit
}

			
function HtmlBody(pageContent) {
	return `<html><body> ${pageContent} </body></html>`;
}

function HtmlImgurAlbum(url) {
	var regex = /imgur.com\/a\/(\w+)/i; ///////change to const?
	var result = regex.exec(url);
	if(result === null) return HtmlDiv(HtmlLink(url, `Invalid Imgur album`));
	var albumId = result[1];

	// The official way this is done, according to iframely.com:
	/*
		<blockquote class="imgur-embed-pub" lang="en" data-id="a/twP6C">
			<a href="https://imgur.com/a/twP6C">Hey Imgur want to see some magic? (OC)</a>
		</blockquote>
		<script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
	*/
	// However, this does not work, because the script never runs, since I embed into an already created page
	// The result of the script is the following, and I simply inject the correct AlbumId's and chockingly, it works:
	return `<iframe class="imgur-embed-iframe-pub imgur-embed-iframe-pub-a-${albumId}-true-540" scrolling="no" src="https://imgur.com/a/${albumId}/embed?pub=true" id="imgur-embed-iframe-pub-a-${albumId}" style="height: 900px; width: 540px; margin: 10px 0px;"></iframe>`;
}

function HtmlTwitter(url) {
	return HtmlLink(url, "Twitter post");
}

function HtmlPageTitle(title) {
	return `<h1>${title}</h1>`;
}

function HtmlTimeSpan(toEpoch, fromEpoch) { 
	var from = new Date(fromEpoch * 1000); // Needs epoch milliseconds as input
	var to = new Date(toEpoch * 1000);
	return HtmlPostTitle(`Spans ${convertEpochToDays(fromEpoch)} days`) + HtmlLineBreak() + HtmlPostTitle(`${from.toString()} to ${to.toString()}`) + HtmlLineDivider();
}

function HtmlPostTitle(postTitle) {
	return `<b>${postTitle}</b>`; 
}

function HtmlLineBreak() {
	return `<br>`;
}

function HtmlLineDivider() {
	return `<hr>`;
}

function HtmlComments(threadUrl, num_comments) {
	return HtmlLink(threadUrl, num_comments + " comments");
}

function HtmlLink(url, text) {
	return `<p>
				<a href="${url}">${text}</a>
			</p>`;
}

function HtmlImage(imageUrl) {
	return HtmlDiv(`<a href="${imageUrl}">
						<img style="max-width: 100%; max-height: 100%" src="${imageUrl}"/>
					</a>`);
	// Perhaps add: height: inherit !important; according to https://stackoverflow.com/questions/3751565/css-100-width-or-height-while-keeping-aspect-ratio/26065762
}

function HtmlMp4(url) {
	return HtmlDiv(
		`<video controls autoplay loop muted src="${url}"> 
			Your browser does not support the video tag. 
		</video>`);
	// In order for autoplay to work on multiple videos at once, they have to be muted
}

function HtmlDiv(content) {
	return `<div>
				${content}
			</div>`;
		//style="left: 0; width: 100%; height: 0; position: relative;" 
}

function HtmlGiphy(url) {
	const regex = /giphy\.com\/gifs\/(\w+)/i;
	return HtmlIFrame("Giphy", regex, "https://giphy.com/embed/", url, "");
	// Doesn't work with all kinds of Giphy links yet
}

function HtmlGfycat(url) {
	// To embed gfycats like normal, do: 
	// return HtmlIFrame("Gfycat", regex, "https://gfycat.com/", url, "");
	// However, the easiest and prettiest way is just by using giant.gfycat links with the mp4 player

	const regex = /gfycat\.com\/(?:gifs\/detail\/)?(?:ifr\/)?(\w+)/i; // gifs/detail/ is an optional non capture group
	var result = regex.exec(url);
	if(result === null) return HtmlDiv(HtmlLink(url, `Invalid Gfycat link`));
	var videoId = result[1];

	return HtmlMp4(`https://giant.gfycat.com/${videoId}.mp4`)
}

function HtmlDailymotion(url) {
	const regex = /dailymotion\.com\/video\/(\w+)/i;
	return HtmlIFrame("Dailymotion", regex, "https://www.dailymotion.com/embed/video/", url, "");
}

function HtmlYoutube(url) {
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
	//Turns: https://m.youtube.com/watch?v=hWLjYJ4BzvI&feature=youtu.be into hWLjYJ4BzvI, etc, see: https://stackoverflow.com/questions/6903823/regex-for-youtube-id

	return HtmlIFrame("Youtube", regex, "https://youtube.com/embed/", url, "");
}

function HtmlPorhub(url) {
	const regex = /pornhub.com\/view_video\.php\?viewkey=(\w+)/i;
	return HtmlIFrame("Pornhub", regex, "https://www.pornhub.com/embed/", url, "");
}

///////////////Only works with .com THAT SHOULD BE FIXABLE WITH BETTER REGEX: Same applies to all the other occurances

function HtmlRedtube(url) {
	const regex = /redtube.com\/(\w+)/i;
	return HtmlIFrame("Redtube", regex, "https://embed.redtube.com/?id=", url, "");
}

function HtmlYouporn(url) {
	const regex = /youporn.com\/watch\/(\w+)/i;
	return HtmlIFrame("Youporn", regex, "https://www.youporn.com/embed/", url, "");
}

function HtmlXvideos(url) {
	const regex = /xvideos.com\/video(\w+)/i;
	return HtmlIFrame("XVideos", regex, "https://www.xvideos.com/embedframe/", url, "");
}

function HtmlXhamster(url) {
	const regex = /xhamster.com\/videos\/.*-(\w+)/i; // Matches the group after the last occurence of "-"
	return HtmlIFrame("XHamster", regex, "https://xhamster.com/embed/", url, "");
}

function HtmlIFrame(hostName, regex, srcStart, url, srcEnd) {
	var result = regex.exec(url);
	if(result === null) return HtmlDiv(HtmlLink(url, `Invalid ${hostName} link`));
	var videoId = result[1];
	return HtmlResponsiveDiv(`<iframe src="${srcStart}${videoId}${srcEnd}" frameborder="0" scrolling="no" allowfullscreen style="width: 100%; height: 100%; position: absolute;"></iframe>`);
}

function HtmlResponsiveDiv(content) {
	return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;">${content}</div>`;
}

function HtmlSelfPost() {
	return `Self Post: Cannot Embed`;
	// RI don't know how to embed the contents of a self post (it's not in the JSON file, so I'd have to query something entirely different)
}

function HtmlImageWithoutExtension(url) {
	return HtmlImage(url + ".jpg");
}
