// Get the current year for the copyright
$('#year').text(new Date().getFullYear());

// Configure Slider
$('.carousel').carousel({
	interval: 2000,
	pause: 'hover'
});

// Lightbox Init
$(document).on('click', '[data-toggle="lightbox"]', function(event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});
