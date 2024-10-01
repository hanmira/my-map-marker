class Place {
  constructor(id, isStarred, name, type, spend, img, latitude, longitude) {
    this.id = id;
    this.isStarred = false;
    this.name = name;
    this.type = type; // Can be "restaurant", "cafe", etc.
    this.spend = spend;
    this.img = img;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  createVisitLog() {
    const today = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${months[month]} ${day}, ${year}`;
  }

  isExpensive() {
    if (this.spend > 500000) {
      return true;
    }
  }
}

class Restaurant extends Place {
  constructor(
    id,
    isStarred,
    name,
    type,
    spend,
    img,
    cuisine,
    latitude,
    longitude
  ) {
    super(id, isStarred, name, type, spend, img, latitude, longitude); // Call parent constructor with specific type
    this.cuisine = cuisine;
  }
}

class CoffeeShop extends Place {
  constructor(
    id,
    isStarred,
    name,
    type,
    spend,
    img,
    vibe,
    latitude,
    longitude
  ) {
    super(id, isStarred, name, type, spend, img, latitude, longitude); // Call parent constructor with specific type
    this.vibe = vibe;
  }
}

class App {
  places = [];
  map = null;
  latitude = 0;
  longitude = 0;
  zoomSize = 13;

  constructor() {
    // htmml els
    this.placeForm = document.getElementById("add-place-form");
    this.inputType = document.getElementById("type");
    this.inputName = document.getElementById("name");
    this.inputSpend = document.getElementById("spend");
    this.inputImg = document.getElementById("inputImg");
    this.btnAdd = document.getElementById("btn-add");
    this.placeList = document.querySelector(".place-list");

    ///init funcs
    this.initMap();
    //when clicked on the add btn, get form
    this.btnAdd.addEventListener("click", (e) => {
      e.preventDefault();
      this.createNewVisitedPlace();
      this.showResults();
      // document.querySelector(".searchbar").value = "";
      this.searchPlace();
    });
    //change the cuisine and vibe input base on type
    this.inputType.addEventListener("change", this.toggleHiddenEl);
    //move map to the element's lat and lng
    this.placeList.addEventListener("click", this.moveToMap.bind(this));
    //close add place box on click
    if (this.placeForm) {
      this.close(this.placeForm);
    }
  }

  /////////////////////PLACES AND ITS METHOD////////////////////
  //getter for places[]
  getPlaces() {
    return [...this.places];
  }

  //setter for places[]
  setPlaces(newPlace) {
    this.places = [...this.places, newPlace];
  }

  clearExistingMarkers() {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.marker) {
        this.map.removeLayer(layer);
      }
    });
  }

  updateMarkers(newPlaces) {
    // Clear existing markers
    this.clearExistingMarkers();
    // Add markers for new places
    newPlaces.forEach((place) => {
      this.addNewMarker(place);
    });
  }

  updateVisitedPlaceList(newPlaces) {
    //clear existing
    document.querySelector(".places-list").innerHTML = "";
    //add new
    newPlaces.forEach((place) => {
      this.addVisitedPlace(
        place.type,
        place.name,
        place.createVisitLog,
        place.id
      );
    });
  }
  /////////////////////PLACES AND ITS METHOD////////////////////

  //close item on btn click
  close(item) {
    document.querySelector(".btn-close-form").addEventListener("click", () => {
      item.style.display = "none";
    });
  }

  //format input spend
  formatCurrency(number) {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(number);
  }

  // Function to generate a unique ID for each place
  generateUniqueId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Initialize Leaflet map (assuming map container with ID "map" exists)
  initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => this.loadMap(position),
        (error) => this.showError(error)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  loadMap(position) {
    const { latitude, longitude } = position.coords;
    this.map = L.map("map").setView([latitude, longitude], this.zoomSize);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/attribution">CARTO</a> contributors',
      }
    ).addTo(this.map);
    // this.initPlaceMarkers();
    //when clicked on map, the form appear
    this.map.on("click", (e) => {
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;
      this.showForm();
    });
  }

  showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      default:
        alert("An unknown error occured.");
    }
  }

  toggleHiddenEl() {
    document.getElementById("cuisine").closest("div").classList.toggle("hide");
    document.getElementById("vibe").closest("div").classList.toggle("hide");
  }

  showForm() {
    document.getElementById("add-place-form").style.display = "flex";
  }

  hideForm() {
    document.getElementById("add-place-form").style.display = "none";
  }

  clearForm() {
    this.inputName.value = "";
    this.inputSpend.value = "";
  }

  //convert img to base64
  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };
      reader.readAsDataURL(file);
    });
  }

  createNewVisitedPlace() {
    const validNums = (...inputs) => {
      return inputs.every((input) => Number.isFinite(input) && input > 0);
    };

    const validStrings = (...inputs) => {
      return inputs.every((input) => input !== null);
    };

    //get input vals
    const typeValue = this.inputType.value.trim();
    const nameValue = this.inputName.value.trim().toUpperCase();
    const spendValue = +this.inputSpend.value.trim();
    // const imgSrc = this.getInputImg();
    let imgSrc;
    let newPlace;

    // this.inputImg.addEventListener("change", async (e) => {
    //   e.preventDefault();
    //   const file = e.target;
    //   const imgFile = file.files[0];
    //   // console.log(imgFile);
    //   try {
    //     const base64String = await this.toBase64(imgFile);
    //     imgSrc = base64String; // Assign base64 string only if successful

    //     if (typeValue === "Restaurant") {
    //       const cuisineValue = document.getElementById("cuisine").value.trim();
    //       newPlace = new Restaurant(
    //         this.generateUniqueId(),
    //         nameValue,
    //         typeValue,
    //         spendValue,
    //         imgSrc,
    //         cuisineValue,
    //         this.latitude,
    //         this.longitude
    //       );
    //     } else if (typeValue === "Coffee") {
    //       const vibeValue = document.getElementById("vibe").value.trim();
    //       newPlace = new CoffeeShop(
    //         this.generateUniqueId(),
    //         nameValue,
    //         typeValue,
    //         spendValue,
    //         imgSrc,
    //         vibeValue,
    //         this.latitude,
    //         this.longitude
    //       );
    //     }

    //     if (
    //       validNums(spendValue) &&
    //       validStrings(typeValue, nameValue, imgSrc || "") // Check imgSrc if assigned
    //     ) {
    //       this.places.push(newPlace);
    //       this.addNewMarker(newPlace);
    //       this.addVisitedPlace(
    //         newPlace.type,
    //         newPlace.name,
    //         newPlace.createVisitLog,
    //         newPlace.id
    //       );
    //       this.clearForm();
    //       this.hideForm();
    //       this.starPlace();
    //     } else {
    //       alert("Input must be a positive number and not null!");
    //     }
    //   } catch (error) {
    //     console.error("Error converting to base64:", error);
    //   }
    // });

    // check if type is res, add new res
    if (typeValue === "Restaurant") {
      const cuisineValue = document.getElementById("cuisine").value.trim();
      //check if the input is valid
      //and add to the places object
      if (
        validNums(spendValue) &&
        validStrings(typeValue, nameValue, cuisineValue)
      ) {
        newPlace = new Restaurant(
          this.generateUniqueId(),
          false,
          nameValue,
          typeValue,
          spendValue,
          imgSrc,
          cuisineValue,
          this.latitude,
          this.longitude
        );
        //add the new created obj to the places array
        // this.places.push(newPlace);
        this.setPlaces(newPlace);
        this.addNewMarker(newPlace);
        this.addVisitedPlace(
          newPlace.type,
          newPlace.name,
          newPlace.createVisitLog,
          newPlace.id
        );
        //clear and hide the form
        this.clearForm();
        this.hideForm();
        // this.starPlace();
      } else {
        alert("Input must be a positive number and not null!");
      }
    }
    // check if type is café, add new café
    if (typeValue === "Coffee") {
      const vibeValue = document.getElementById("vibe").value.trim();
      if (
        validNums(spendValue) &&
        validStrings(typeValue, nameValue, vibeValue)
      ) {
        newPlace = new CoffeeShop(
          this.generateUniqueId(),
          false,
          nameValue,
          typeValue,
          spendValue,
          imgSrc,
          vibeValue,
          this.latitude,
          this.longitude
        );
        //add the new created obj to the places array
        // this.places.push(newPlace);
        this.setPlaces(newPlace);
        this.addNewMarker(newPlace);
        this.addVisitedPlace(
          newPlace.type,
          newPlace.name,
          newPlace.createVisitLog,
          newPlace.id
        );
        //clear and hide the form
        this.clearForm();
        this.hideForm();
        // this.starPlace();
      } else {
        alert("Input must be a positive number and not null!");
      }
    }
  }

  addNewMarker(place) {
    let myIcon = L.icon({
      iconUrl: `${
        place.type === "Restaurant"
          ? "https://cdn-icons-png.flaticon.com/128/5695/5695168.png"
          : "https://cdn-icons-png.flaticon.com/128/5695/5695091.png"
      }`,
      iconSize: [30, 30],
      iconAnchor: [18, 80],
      popupAnchor: [-3, -76],
      shadowUrl: "https://cdn-icons-png.flaticon.com/128/1783/1783356.png",
      shadowSize: [30, 30],
      shadowAnchor: [18, 65],
    });
    L.marker([place.latitude, place.longitude], { icon: myIcon })
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          // autoClose: false,
          closeOnClick: false,
          className: `${place.type.toLowerCase()}-popup`,
        })
      )
      .setPopupContent(
        `
        <div class="marker">
          <div class="marker-img-wrapper">
            <img
              src=${
                place.imgSrc
                  ? place.imgSrc
                  : "https://i.pinimg.com/564x/29/d7/82/29d78295535e54838c41c67d4872832a.jpg"
              }
              alt=""
            />
            <div class="marker-tag marker-${
              place.isExpensive() ? "expensive" : "affordable"
            }">${place.isExpensive() ? "Expensive" : "Affordable"}</div>
          </div>
          <h1 class="marker-name">${place.name} 
        </h1>
          <ul class="marker-desc">
            <li> ${
              place.type === "Restaurant"
                ? `<span class="material-symbols-outlined">
            menu_book
            </span>`
                : `<span class="material-symbols-outlined"> cardiology </span>`
            }
               ${
                 place.type === "Restaurant"
                   ? `Cuisine: ${place.cuisine}`
                   : `Vibe: ${place.vibe}`
               } 
            </li>
            <li>
              <span class="material-symbols-outlined"> paid </span> Spend: ${this.formatCurrency(
                place.spend
              )}
            </li>
          </ul>
        </div>
        `
      )
      .openPopup();
  }

  addVisitedPlace(type, name, createVisitLog, id) {
    let imgSrc = "";
    let imgClass = "";
    const visitLog = `Visited <b>${name}</b> on <i>${createVisitLog()}</i>`;
    if (type === "Restaurant") {
      imgSrc = "https://cdn-icons-png.flaticon.com/128/209/209116.png";
      imgClass = "restaurant";
    } else if (type === "Coffee") {
      imgSrc = "https://cdn-icons-png.flaticon.com/128/1269/1269079.png";
      imgClass = "coffee";
    }
    const html = `
        <div class="place-list-item" data-id=${id}>
          <div class="place-img-wrapper place-img-${imgClass}">
            <img
              src=${imgSrc}
              alt=""
            />
          </div>
          <div class="visit-log">${visitLog}</div>
          <div class="btn btn-view">View</div>
        </div>
      `;
    document.querySelector(".place-list").insertAdjacentHTML("beforeend", html);
  }

  moveToMap(e) {
    let btnView = e.target.closest(".btn-view");
    // console.log(btnView);
    if (btnView) {
      let placeListItem = e.target.closest(".place-list-item");
      // console.log(placeListItem);
      // console.log(placeListItem.dataset.id);
      btnView.addEventListener("click", () => {
        const foundPlace = this.places.find(
          (place) => place.id === placeListItem.dataset.id
        );
        // console.log(foundPlace);

        if (foundPlace) {
          const { latitude, longitude } = foundPlace;
          this.map.setView([latitude, longitude], this.zoomSize);
        } else {
          console.error("Place not found in places array");
        }
      });
    }
  }

  showResults() {
    document.querySelector(
      ".total-places"
    ).textContent = `${this.places.length} Results`;
  }

  searchPlace() {
    const searchBar = document.querySelector(".searchbar");
    const placeList = document.querySelector(".place-list");
    let searchTerm;
    searchBar.addEventListener("change", (e) => {
      searchTerm = e.target.value.toLowerCase();
      if (searchTerm) {
        const foundPlaces = this.places.filter((place) =>
          place.name.toLowerCase().includes(searchTerm)
        );
        // console.log(foundPlaces);
        if (foundPlaces.length > 0) {
          placeList.innerHTML = "";
          foundPlaces.forEach((place) => {
            this.addVisitedPlace(
              place.type,
              place.name,
              place.createVisitLog,
              place.id
            );
          });
          document.querySelector(
            ".total-places"
          ).textContent = `${foundPlaces.length} Results`;
        } else {
          document.querySelector(".total-places").textContent = `0 Results`;
          placeList.innerHTML = `No result match "${searchTerm}".`;
        }
      } else {
        placeList.innerHTML = "";
        this.places.forEach((place) => {
          this.addVisitedPlace(
            place.type,
            place.name,
            place.createVisitLog,
            place.id
          );
        });
        this.showResults();
      }
    });
  }

  //star a place
  // starPlace() {
  //   const markers = document.querySelectorAll(".marker");
  //   markers.forEach((marker) => {
  //     //when marker is clicked, get the e target closest to ion icon
  //     marker.addEventListener("click", (e) => {
  //       //should have check if isStarred?
  //       const starIcon = e.target.closest("ion-icon[name='star-outline']");
  //       // console.log(starIcon);
  //       const unStarIcon = marker.querySelector("ion-icon[name='star']");
  //       // console.log(unStarIcon);
  //       if (starIcon) {
  //         starIcon.addEventListener("click", (e) => {
  //           const placeToStar = this.places.find(
  //             (place) => place.id === starIcon.dataset.id
  //           );
  //           placeToStar.isStarred = !placeToStar.isStarred;
  //           // console.log(placeToStar);
  //           starIcon.click();
  //           starIcon.classList.toggle("hide");
  //           unStarIcon.classList.toggle("hide");
  //         });
  //       } else {
  //         unStarIcon.addEventListener("click", () => {
  //           unStarIcon.click();
  //           unStarIcon.classList.toggle("hide");
  //           const starOutlineIcon = marker.querySelector(
  //             "ion-icon[name='star-outline']"
  //           );
  //           starOutlineIcon.classList.toggle("hide");
  //         });
  //       }
  //     });
  //   });
  // }
}

const app = new App();
