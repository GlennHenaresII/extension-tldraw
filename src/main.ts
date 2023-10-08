class TLDrawInstance {
  constructor(
    public window: ext.windows.Window | null,
    public tab: ext.tabs.Tab | null,
    public webview: ext.webviews.Webview | null,
    public isCreated: boolean
  ) { }
}

// Global resources
let windowsCount = 0;
let TLDrawInstances: TLDrawInstance[] = [];
let websession: ext.websessions.Websession | null = null;

// Click extension
ext.runtime.onExtensionClick.addListener(async () => {
  try {
    let foundIndex = -1;

    if (TLDrawInstances.some((props, index) => {
      if (!props.isCreated) {
        foundIndex = index;
        return true;
      }
      return false;
    })) {
      // Reuse empty slot
      windowsCount = foundIndex + 1;
    } else {
      // Increment when no empty slot
      windowsCount++;
    }

    // Create window
    const window = await ext.windows.create({
      title: `TLDraw #${windowsCount}`,
      icon: 'icons/icon-128.png',
      fullscreenable: true,
      vibrancy: false,
      frame: true,
    });

    // Create tab
    const tab = await ext.tabs.create({
      icon: 'icons/icon-128.png',
      text: `TLDraw #${windowsCount}`,
      muted: true,
      mutable: false,
      closable: true,
    });

    // Create websession
    const websession = await ext.websessions.create({
      partition: `TLDraw ${windowsCount}`,
      persistent: true,
      cache: true,
      global: false,
    });

    const size = await ext.windows.getContentSize(window.id);

    const webview = await ext.webviews.create({
      websession: websession,
    });

    await ext.webviews.loadFile(webview.id, 'index.html');
    await ext.webviews.attach(webview.id, window.id);
    await ext.webviews.setBounds(webview.id, { x: 0, y: 0, width: size.width, height: size.height });
    await ext.webviews.setAutoResize(webview.id, { width: true, height: true });

    // Update or add instance to the array
    if (foundIndex !== -1) {
      TLDrawInstances[foundIndex] = new TLDrawInstance(window, tab, webview, true);
    } else {
      TLDrawInstances.push(new TLDrawInstance(window, tab, webview, true));
    }
  } catch (error) {
    console.error('ext.runtime.onExtensionClick', JSON.stringify(error));
  }
});

// Click tab
ext.tabs.onClicked.addListener(async (event) => {
  try {
    TLDrawInstances.forEach(async (props) => {
      if (props.tab && props.tab.id === event.id) {
        await ext.windows.restore(props.window!.id);
        await ext.windows.focus(props.window!.id);
      }
    });
  } catch (error) {
    console.error('ext.tabs.onClicked', JSON.stringify(error));
  }
});

// Close tab
ext.tabs.onClickedClose.addListener(async (event) => {
  try {
    TLDrawInstances.forEach(async (props) => {
      if (props.tab && props.tab.id === event.id) {
        await ext.tabs.remove(props.tab.id);
        await ext.windows.remove(props.window!.id);
        await ext.webviews.remove(props.webview!.id);
        props.tab = null;
        props.window = null;
        props.webview = null;
        props.isCreated = false;
      }
    });
  } catch (error) {
    console.error('ext.tabs.onClickedClose', JSON.stringify(error));
  }
});

// Close window
ext.windows.onClosed.addListener(async (event) => {
  try {
    TLDrawInstances.forEach(async (props) => {
      if (props.window && props.window.id === event.id) {
        await ext.tabs.remove(props.tab!.id);
        await ext.webviews.remove(props.webview!.id);
        props.tab = null;
        props.window = null;
        props.webview = null;
        props.isCreated = false;
      }
    });
  } catch (error) {
    console.error('ext.windows.onClosed', JSON.stringify(error));
  }
});