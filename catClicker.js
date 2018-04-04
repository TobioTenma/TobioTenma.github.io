"use strict";

let fallingKittenContainer = document.getElementById("main");
let kittenDisplay = document.getElementById("kittenDisplay");
let levelDisplay = document.getElementById("levelDisplay");
let cat = document.getElementById("mama");
let shop = document.getElementById("shop");

let kittenSpawnedCount = 0;
let kittenCount = 0;
let kittensPerSecond = 0;
let catLevel = 0;

let lastUpdate = -1;

let catPool = [];

function catClick() {
    addKittens(1);
}

function spawnKitten() {
  let newCat;
  if (catPool.length !== 0) {
    newCat = catPool.pop();
  } else {
    newCat = document.createElement("img");
    newCat.src = "cat.png";
    newCat.classList.add("catGIF");
  }

  newCat.style.left = (Math.random() * (window.innerWidth - 45)) + "px";
  fallingKittenContainer.append(newCat);

  setTimeout(recycleCat, 1200, newCat);
}

function recycleCat(cat) {
  fallingKittenContainer.removeChild(cat);
  catPool.push(cat);
}

//only enable the items the user can currently purchase
function updateShop() {
  let children = shop.childNodes;
  for (let i = 0; i < children.length; ++i) {
    let shopItem = children[i];
    shopItem.style.display = (!shopItem.minLevel || catLevel >= shopItem.minLevel) ? "inline" : "none";
    shopItem.disabled = kittenCount < shopItem.cost;
  }
}

function attemptPurchase(event) {
    let button = event.currentTarget;

    let cost = button.cost;
    let multiplier = button.multiplier;

    subKittens(cost);

    //first upgrade starts off the auto kittens
    if (multiplier === 0) {
      kittensPerSecond = Math.max(1, kittensPerSecond);
    } else {
      kittensPerSecond *= multiplier;
    }

    ++catLevel;
    levelDisplay.textContent = `LVL ${catLevel}`;

    button.removeEventListener("click", attemptPurchase);
    shop.removeChild(button);

    if (button.unlockedItems) {
      let unlockedItems = button.unlockedItems;
      for (let i = 0; i < unlockedItems.length; ++i) {
        let button = createShopButton(unlockedItems[i]);
        shop.appendChild(button);
      }
    }

    cat.style.backgroundImage = `url("cat${catLevel}.gif")`;
}

function subKittens(count) {
  kittenCount -= count;
  kittenSpawnedCount -= count;
}

function addKittens(count) {
  kittenCount += count;
}

//timestamp is the current time in milliseconds
function update(timestamp) {
  //time between last update and this one
  let delta = timestamp - lastUpdate;

  //ignore deltas larger than 1 second, it usually means an error happened or the user clicked away
  if (delta < 1000) {
      addKittens(kittensPerSecond * delta / 1000);

      //put any other update logic here that involves lapses in time between frames
  }
  kittenDisplay.textContent = `${Math.floor(kittenCount)} kittens`;
  updateShop();

  lastUpdate = timestamp;

  while (kittenSpawnedCount < kittenCount - 1) {
    spawnKitten();
    ++kittenSpawnedCount;
  }

  //request to be rendered again, yes it is an infinite loop, but with a delay!
  window.requestAnimationFrame(update);
}

function createShopButton(upgrade) {
    let button = document.createElement("button");

    button.name = upgrade.name;
    button.cost = upgrade.cost;
    button.multiplier = upgrade.multiplier;
    button.minLevel = upgrade.minLevel;
    button.unlockedItems = upgrade.unlockedItems;
    button.addEventListener('click', attemptPurchase, true);

    button.innerHTML = `${upgrade.name}<br>${upgrade.cost}`;

    return button;
}

//called only once during initialization
function populateShop() {
  let upgrades = [
    {name: "Auto Feeder", cost: 20, multiplier: 0,
      unlockedItems: [
        {name: "Wet food", cost: 30, multiplier: 2},
        {name: "Enriched food", cost: 50, multiplier: 2},
      ]
    },
    {name: "Abstinence-only education", cost: 10, multiplier: 16, minLevel: 3},
    ];

  for (let i = 0; i < upgrades.length; ++i) {
    let button = createShopButton(upgrades[i]);
    shop.appendChild(button);
  }
}
populateShop();

//kick off the rendering loop
window.requestAnimationFrame(update);
