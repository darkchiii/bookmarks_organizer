console.log('Loaded');

let bookmarksData = null;
let selectedFolders = new Set();

let totalFolders = 0;
let totalBookmarks = 0;

init();

async function init() {
    console.log('Initializing panel...');

    try {
        await loadBookmarks();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load bookmarks. Please try refreshing the panel.');
    }
}

// chrome.bookmarks.getTree() zwraca Promise z całym drzewem zakładek
// Struktura każdego node:
// {
//   id: string,
//   title: string,
//   url?: string,        // tylko dla bookmarks
//   children?: array,    // tylko dla folders
//   dateAdded: number,
//   parentId: string
// }

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

    updateStats();

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

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `node-${node.id}`;
        checkbox.checked = true;
        checkbox.dataset.nodeId = node.id;

        selectedFolders.add(node.id);

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedFolders.add(node.id);
            } else {
                selectedFolders.delete(node.id);
            }
            updateStats();
        });

        const icon = document.createElement('span');
        icon.className = 'folder-icon';
        icon.textContent = '▶';
        icon.style.fontSize = '10px';
        icon.style.color = '#999';

        const label = document.createElement('label');
        label.htmlFor = `node-${node.id}`;
        label.innerHTML = `<strong>${node.title}</strong> <span style="color: #999; font-size: 12px;">(${node.children.length})</span>`;

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'bookmark-children';
        childrenDiv.id = `children-${node.id}`;

        const toggleFolder = () => {
            const isVisible = childrenDiv.classList.contains('visible');
            childrenDiv.classList.toggle('visible');
            icon.classList.toggle('open');
            icon.textContent = isVisible ? '▶' : '▼';
        };

        icon.addEventListener('click', toggleFolder);
        label.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFolder();
        });

        folderDiv.appendChild(checkbox);
        folderDiv.appendChild(icon);
        folderDiv.appendChild(label);

        nodeDiv.appendChild(folderDiv);

        node.children.forEach(child => {
            renderBookmarkNode(child, childrenDiv, level + 1);
        });

        nodeDiv.appendChild(childrenDiv);

    } else if (node.url) {
        totalBookmarks++;

        const bookmarkDiv = document.createElement('div');
        bookmarkDiv.className = 'bookmark-item';
        bookmarkDiv.title = node.url;

        const favicon = document.createElement('img');
        const domain = new URL(node.url).hostname;
        favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
        favicon.width = 16;
        favicon.height = 16;
        favicon.style.flexShrink = '0';

        const title = document.createElement('span');
        title.textContent = node.title || node.url;
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.whiteSpace = 'nowrap';

        bookmarkDiv.appendChild(favicon);
        bookmarkDiv.appendChild(title);

        nodeDiv.appendChild(bookmarkDiv);
    }

    container.appendChild(nodeDiv);
}

function updateStats() {
    document.getElementById('folder-count').textContent = totalFolders;
    document.getElementById('bookmark-count').textContent = totalBookmarks;
    document.getElementById('selected-count').textContent = selectedFolders.size;
}

// function setupEventListeners() {
//     const analyzeBtn = document.getElementById('analyze-btn');

//     analyzeBtn.addEventListener('click', async () => {
//         console.log('Starting analysis...');
//         console.log('Selected folders:', Array.from(selectedFolders));

//         if (selectedFolders.size === 0) {
//             alert('Please select at least one folder to analyze!');
//             return;
//         }

//         analyzeBtn.disabled = true;
//         analyzeBtn.innerHTML = 'Analyzing...';

//         try {
//             await analyzeBookmarks();
//         } catch (error) {
//             console.error('Analysis error:', error);
//             showError('Analysis failed: ' + error.message);
//         } finally {
//             analyzeBtn.disabled = false;
//             analyzeBtn.innerHTML = 'Analyze & Organize Bookmarks';
//         }
//     });
// }

// async function analyzeBookmarks() {
//     console.log('Collecting bookmarks from selected folders...');

//     const bookmarksToAnalyze = [];

//     for (const folderId of selectedFolders) {
//         const subtree = await chrome.bookmarks.getSubTree(folderId);
//         extractBookmarks(subtree[0], bookmarksToAnalyze);
//     }

//     console.log(`Found ${bookmarksToAnalyze.length} bookmarks to analyze`);
//     console.log('Sample:', bookmarksToAnalyze.slice(0, 5));

//     // TODO: show results
// }

function extractBookmarks(node, collection) {
    if (node.url) {
        collection.push({
            id: node.id,
            title: node.title,
            url: node.url
        });
    }

    if (node.children) {
        node.children.forEach(child => extractBookmarks(child, collection));
    }
}



console.log('Panel script loaded');