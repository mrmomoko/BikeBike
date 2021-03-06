$(function() {
	$('table#translations td.value').click(function() {
		var $this = $(this);
		if(!$this.find('.translation-form').length) {
			startTranslating($this);
		}
	});
	if ($('table#translations').length) {
		$(document).click(function(event) {
			$target = $(event.target);
			if ($target.closest('table#translations').length < 1 && !$target.hasClass('auto-translate')) {
				stopTranslating();
			}
		});
		$('.auto-translate').click(function(event) {
			event.preventDefault();
			$td = $(this).parent();
			saveTranslation($td, null, true);
		});
	}
});
	
function saveTranslation($td, $move_to, auto_translate) {
	var val = '';
	var do_auto_translate = true;
	if (typeof auto_translate == "undefined" || !auto_translate) {
		val = $td.find('textarea').val();
		do_auto_translate = false;
	}
	var key = $td.parent().data().key;
	var params = {
		translationkey: key,
		translationvalue: val,
		translationlang: window.location.href.replace(/^.*\/(\w+)\/$/, '$1')
	};
	if (do_auto_translate) {
		params['auto_translate'] = true;
	}
	params['authenticity_token'] = $('table#translations').data().token;
	$.post('/translate/', params, function(json) {
		$td.html(json.translation);
		if ($td.parent().hasClass('not-exists')) {
			$td.parent().removeClass('not-exists');
			$td.parent().addClass('exists');
		}
		$('.translation-form').remove();
		if (typeof $move_to != "undefined" && $move_to) {
			startTranslating($move_to);
		}
	});
}

function stopTranslating() {
	$('.translation-form').remove();
}

function startTranslating($td) {
	stopTranslating();
	var value = $td.parent().hasClass('not-exists') ? '' : $td.html().trim();
	var $tr = $td.parent();
	var key = $tr.data().key;
	$td.append('<div class="translation-form"><textarea>' + value + '</textarea><button class="small" data-key="' + key + '">Save</textarea>');
	var $textarea = $td.find('textarea');
	$textarea.select();
	$td.find('.translation-form button').click(function() { saveTranslation($td); });
	$textarea.keydown(function(event) {
		if (event.keyCode == 9) {
			event.preventDefault();
			var $new_tr = event.shiftKey ? $tr.prev() : $tr.next();
			saveTranslation($td, $new_tr.find('.value'));
		} else if (event.keyCode == 27) {
			stopTranslating();
		}
	});
}
