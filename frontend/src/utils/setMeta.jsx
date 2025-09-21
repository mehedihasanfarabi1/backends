export function setMeta({ title, icon }) {
  // Title change
  if (title) {
    document.title = title;
  }

  // Favicon change
  if (icon) {
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = icon; // dynamic icon url
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}
