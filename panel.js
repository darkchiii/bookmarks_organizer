console.log('TabMind panel loaded');

let bookmarksData = null;
let totalFolders = 0;
let totalBookmarks = 0;

init();

async function init() {
    console.log('Initializing panel...');
    try {
        await loadBookmarks();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

async function loadBookmarks() {
    console.log('Loading bookmarks from Chrome API...');

    const tree = await chrome.bookmarks.getTree();
    bookmarksData = tree[0];

    console.log('Raw bookmarks tree:', bookmarksData);

    totalFolders = 0;
    totalBookmarks = 0;

    const container = document.getElementById('bookmarks-tree');
    container.innerHTML = '';

    if (bookmarksData.children) {
        bookmarksData.children.forEach(child => {
            renderBookmarkNode(child, container, 0);
        });
    }

    document.getElementById('analyze-btn').disabled = false;

    console.log(`Loaded ${totalFolders} folders, ${totalBookmarks} bookmarks`);
}

function renderBookmarkNode(node, container, level) {
    if (!node.title) return;

    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'bookmark-node';
    nodeDiv.style.marginLeft = `${level * 16}px`;

    if (node.children) {
        totalFolders++;

        const folderDiv = document.createElement('div');
        folderDiv.className = 'bookmark-folder';
        folderDiv.innerHTML = `<strong>${node.title}</strong> <span style="color: #999;">(${node.children.length})</span>`;

        nodeDiv.appendChild(folderDiv);

        node.children.forEach(child => {
            renderBookmarkNode(child, container, level + 1);
        });

    } else if (node.url) {
        totalBookmarks++;

        const bookmarkDiv = document.createElement('div');
        bookmarkDiv.className = 'bookmark-item';
        bookmarkDiv.textContent = `${node.title || node.url}`;

        nodeDiv.appendChild(bookmarkDiv);
    }

    container.appendChild(nodeDiv);
}

console.log('Panel script loaded');