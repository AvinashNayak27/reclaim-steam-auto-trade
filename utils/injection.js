const autoPlaceMarketTrade = async (profile_id, itemName, price) => {
  const getCookieValue = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  const sessionid = getCookieValue("sessionid");

  try {
    // First get the inventory to find the item
    const inventoryResponse = await fetch(
      `https://steamcommunity.com/inventory/${profile_id}/730/2`,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "en-GB,en;q=0.9",
          "cache-control": "max-age=0",
          cookie: document.cookie,
        },
        method: "GET",
      }
    );

    const inventoryData = await inventoryResponse.json();

    // Find the item in descriptions
    const item = inventoryData.descriptions.find(
      (item) => item.name === itemName
    );

    if (!item) {
      throw new Error(`Item ${itemName} not found in inventory`);
    }

    // Find the asset ID for the item
    const asset = inventoryData.assets.find(
      (a) => a.classid === item.classid && a.instanceid === item.instanceid
    );

    if (!asset) {
      throw new Error(`Asset not found for ${itemName}`);
    }

    // Place the market listing
    const sellResponse = await fetch(
      "https://steamcommunity.com/market/sellitem/",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: document.cookie,
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `sessionid=${sessionid}&appid=730&contextid=2&assetid=${asset.assetid}&amount=1&price=${price}`,
        method: "POST",
      }
    );

    const response = await sellResponse.json();
    return {
      ...response,
      assetid: asset.assetid,
      name: item.name,
      price: price
    };
  } catch (error) {
    console.error("Error placing market trade:", error);
    throw error;
  }
};

const intervalId = setInterval(async () => {
  const currentUrl = window.location.href;

  if (currentUrl === "https://steamcommunity.com/market/") {
    const item = window.payloadData.parameters.item;
    const amount = window.payloadData.parameters.amount;

    const anchor = document.querySelector('a[aria-label="View your profile"]');
    if (anchor) {
      const match = anchor.href.match(/\/profiles\/(\d+)\//);
      if (match) {
        if (!item) {
          alert("No item found");
          document.getElementById("tabMyMarketHistory")?.click();
          clearInterval(intervalId);
          return;
        }

        try {
          const res = await autoPlaceMarketTrade(match[1], item, amount);
          alert("Market trade placed");
          window.flutter_inappwebview.callHandler(
            "publicData",
            JSON.stringify(res)
          );

          document.getElementById("tabMyMarketHistory")?.click();
          clearInterval(intervalId);
        } catch (error) {
          console.error("Error in market trade:", error);
          clearInterval(intervalId);
        }
      } else {
        console.log("Steam ID not found in URL");
      }
    } else {
      console.log("Anchor not found");
    }
  }
}, 3000);
