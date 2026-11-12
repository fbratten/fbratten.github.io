// No third-party request until the visitor chooses a player. Links also work
// without JavaScript and remain available if a provider cannot play a track.
document.addEventListener('click', event => {
  const button = event.target.closest('[data-load-player]');
  if (!button) return;
  const box = button.closest('[data-provider][data-media-id]');
  const {provider, mediaId, title} = box.dataset;
  let src;
  if (provider === 'suno' && /^[0-9a-f-]{36}$/.test(mediaId)) {
    src = 'https://suno.com/embed/' + mediaId;
  } else if (provider === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(mediaId)) {
    src = 'https://www.youtube-nocookie.com/embed/' + mediaId;
  } else return;
  const frame = document.createElement('iframe');
  frame.title = title + ' - ' + (provider === 'suno' ? 'Suno' : 'YouTube') + ' player';
  frame.src = src;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allowFullscreen = true;
  frame.tabIndex = 0;
  box.querySelector('[data-player-slot]').replaceChildren(frame);
  frame.focus();
});
