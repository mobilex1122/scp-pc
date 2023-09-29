jQuery.fn.center = function () {
	this.css("position", "absolute");
	this.css(
		"top",
		Math.max(
			0,
			($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop()
		) + "px"
	);
	this.css(
		"left",
		Math.max(
			0,
			($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft()
		) + "px"
	);
	return this;
};
$(function () {});

function OpenFolder(url, fit) {
	const buttonGen = (data) => {
		out = "";
		data.articles.forEach((art) => {
			if (art.requied) {
				out += `<li><button onclick="OpenPassArticle('${
					art.file
				}', '${art.title.replaceAll('"', "&quot;")}', '${art.requied}')">${
					art.title
				}</button></li>`;
			} else {
				out += `<li><button onclick="OpenArticle('${
					art.file
				}', '${art.title.replaceAll('"', "&quot;")}')">${
					art.title
				}</button></li>`;
			}
		});
		return out;
	};
	$("body").addClass("wait");
	$.getJSON("./data/" + url + ".json", function (data) {
		const window = $(`
		<div class="window scale" style="${
			!fit ? "height: 300px;" : ""
		} width: 500px; position: absolute">
			<div class="title-bar">
				<div class="title-bar-text">${data.name}</div>
				<div class="title-bar-controls">
					<button id="title-mini" aria-label="Minimize"></button>
					<button id="title-close" aria-label="Close"></button>
				</div>
			</div>
			<div class="window-body">
				<ul class="tree-view" style="height: calc(100% - 12px)">
					<li>
						${data.name}
						<ul>
							${buttonGen(data)}
						</ul>
					</li>
				</ul>
			</div>
		</div>
		`);
		$("#title-close", window).click(() => {
			window.remove();
		});
		$("#title-mini", window).click(() => {
			window.toggleClass("mini");
		});

		window.draggable({
			handle: ".title-bar",
			stack: "#window-container div",
			containment: "parent",
			scroll: false,
		});
		// window.resizable({});
		window.disableSelection();

		$("#window-container").append(window);
		window.center();
		window.css("z-index", 800);
		$("body").removeClass("wait");
	}).fail(function () {
		$("body").removeClass("wait");
	});
}

function OpenArticle(url, title, fit) {
	$("body").addClass("wait");
	const window = $(`
	<div class="window scale" style="${
		!fit ? "height: 600px;" : ""
	} width: 500px; position: absolute">
		<div class="title-bar">
			<div class="title-bar-text">${title}</div>
			<div class="title-bar-controls">
				<button id="title-mini" aria-label="Minimize"></button>
				<button aria-label="Maximize"></button>
				<button id="title-close" aria-label="Close"></button>
			</div>
		</div>
		<div id="view" class="window-body">
		</div>
	</div>
	`);
	$("#title-close", window).click(() => {
		window.remove();
	});

	$("#title-mini", window).click(() => {
		window.toggleClass("mini");
	});

	window.draggable({
		handle: ".title-bar",
		stack: "#window-container div",
		containment: "parent",
		scroll: false,
	});

	window.css("z-index", 800);

	$("#view", window).load("./data/" + url, function (response, status, xhr) {
		$("body").removeClass("wait");
	});
	$("body").addClass("wait");
	// Getting elements from server and saving the in the variable data

	// window.resizable({});
	// $("div").disableSelection();

	$("#window-container").append(window);
	window.center();
}

function OpenPassArticle(arturl, arttitle, level) {
	const window = $(`
	<div class="window" style="min-height: 20px; position: absolute">
		<div class="title-bar" style="background: linear-gradient(90deg,red,#3c0000);">
			<div class="title-bar-text">Přístup Úrovně ${level}</div>
			<div class="title-bar-controls">
				<button id="title-close" aria-label="Close"></button>
			</div>
		</div>
		<div id="view" class="window-body">
			<form action="" id="login">
				<div class="field-row-stacked" style="width: 200px">
					<label for="text18">Username</label>
					<input id="text" name="user" type="text" required />
				</div>
				<div class="field-row-stacked" style="width: 200px">
					<label for="text19">Password</label>
					<input id="text" name="password" required type="password" />
				</div>
				<div class="field-row">
					<button>Login</button>
				</div>
			</form>
		</div>
	</div>
	`);
	$("#title-close", window).click(() => {
		window.remove();
	});

	$("#login", window).submit(function (e) {
		e.preventDefault();
		$("body").addClass("wait");

		$.getJSON("./data/passwords.json", function (users) {
			const data = $("#login", window).serializeArray();
			if (
				data[0].value == users[level].username &&
				data[1].value == users[level].password
			) {
				OpenArticle(arturl, arttitle);
				window.remove();
			}
			$("body").removeClass("wait");
		}).fail(function () {
			$("body").removeClass("wait");
		});
	});

	window.draggable({
		handle: ".title-bar",
		stack: "#window-container div",
		containment: "parent",
		scroll: false,
	});

	window.css("z-index", 800);

	// Getting elements from server and saving the in the variable data

	// window.resizable({});
	window.disableSelection();

	$("#window-container").append(window);
	window.center();
}
