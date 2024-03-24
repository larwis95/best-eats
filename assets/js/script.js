const storedPlaces = JSON.parse(localStorage.getItem('places'));
const searchDiv = $('#searchDiv');
const search = $('#searchBar');
const bodyEl = $('body');
let savedPlaces = [];

function handleSearchClick(input) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        address: input,
        region: 'US'
    }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0)
        {
            const loc = results[0].geometry.location
            const coords = {lat: loc.lat(), lng: loc.lng()};
            findRestaurants(coords);
            search.val('');
        }
        else 
        {
            searchDiv?.append(`
            <p id="errorText">${input} is not a valid search!`);
            search.val('');
            setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
            $('#navSearch')?.append(`
            <p id="errorText">${input} is not a valid search!`);
            search.val('');
            setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
        }
    })
};

function findRestaurants(coords) {
    const query = {
        location: coords,
        types: ['restaurant'],
        radius: '8046.72'

    };
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    return new Promise((resolve, error) => {
        service.nearbySearch(query, (results) => {
        resolve(results);
        sortRestarants(results);
        });
    })
};

function sortRestarants(restaurants) {
    const highRated = restaurants.sort((a, b) => b.rating - a.rating).slice(0, 5);
    renderList(highRated);
};

//function to render the intial restaurant list, restaurant[i].name = name of restaurant, restaurant[i].rating = rating, restaurant.place_id = place id
function renderList(restaurants) {
    const initialBody = $('#initialBody');
    const navDiv = $('#navSearch');
    initialBody.empty();
    initialBody.attr('style', 'background-image: none; width: auto; height: auto;')
    navDiv.empty();
    navDiv.append(`
    <input class="input has-text-centered" type="text" placeholder="San Jose, CA" id="searchBar">
   `);
   const navBtn = navDiv.append(`<button class="button has-text-centered goBtn">Go</button>`);
   addNavHandler(navBtn);
   renderCards(restaurants, initialBody);
}

function renderCards(restaurants, container) {
    container.append(`<div class="card-list"</div>`)
    const cardUl = $(".card-list");
    for(let i = 0; i < restaurants.length; i++)
    {
        const photo = restaurants[i].photos[0].getUrl({ 'maxWidth': 1000, 'maxHeight': 1000 });
        cardUl.append(`
        <div class="card" data-id="${restaurants[i].place_id}">
            <header class="card-header">
                <p class="card-header-title">${restaurants[i].name}</p>
                <p>${restaurants[i].rating} ☆</p>
            </header>
            <div class="card-img image">
                <img src="${photo}">
            </div>
        </div>`);
    }
    addCardHandler(cardUl);
}

function addCardHandler(list) {
    list.on("click", (event) => {
        event.stopPropagation();
        const tar = $(event.target).closest('.card');
        if (tar.attr('class') === 'card') 
        {
            const id = tar.closest(".card").attr("data-id");
            getModalInfo(id);
        }
        return;
    })
}

function addNavHandler(btn){
    $(btn).on("click", (event) => {
        if ($(event.target).get(0).nodeName === "BUTTON") 
        {
            const input = $('#searchBar').val();
            handleSearchClick(input);
            $('#searchBar').val('');
        }
    });
}

function getModalInfo(id) {
    const request = {
        placeId: id
    };
    const div = document.createElement('div')
    const service = new google.maps.places.PlacesService(div);
    const restaurant = service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) 
        {
            let info = {
                address: place.formatted_address,
                id: place.place_id,
                name: place.name,
                phone: place.formatted_phone_number,
                rating: place.rating,
                reviews: place.reviews,
                website: place.website
            };
            createModal(info);
        }
    });
};

function createModal(restaurant) {
    const btn = checkFavButton(restaurant.id);
    bodyEl.append(`
    <div class="modal">
        <div class="modal-background"></div>
        <div class="modal-card" style="border: 1px solid #D16014">
            <header class="modal-card-head">
                <p class="modal-card-title">${restaurant.name}</p>
                <p class="m-1">Rating: ${restaurant.rating} ☆</p>
                <button class="delete m-1" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="m-4 p-2" style="border: 1px solid white">
                    <ul id="modalInfo">
                        <li class="p2">${restaurant.address}</li>
                        <li class="p2"><a href="${restaurant.website}">Website</a></li>
                        <li class="p2">${restaurant.phone}<li>
                    </ul>
                </div>
                <h2 style="font-weight: bolder">Reviews</h2>
                <ul id="reviewUL">
                </ul>
            </section>
            <footer class="modal-card-foot is-flex is-justify-content-center">
                ${btn}
            </footer>
        </div>
    </div>`);
    showModal();
    addReviews(restaurant);
};

function addReviews(rest) {
    const reviews = rest.reviews;
    const ulEl = $('#reviewUL');
    for (let i = 0; i < reviews.length; i++)
    {
        let author = reviews[i].author_name;
        let rating = reviews[i].rating;
        let time = reviews[i].relative_time_description;
        let text = reviews[i].text;
        ulEl.append(`
            <li class="m-1 p-1" style="border-bottom: 1px solid white">
                <article class="media">
                    <div class="media-content">
                        <div class="content">
                            <p>
                            <strong>${author}</strong> | <small>${rating} ☆</small> | <small>${time}</small>
                            <br>
                            ${text}
                            </p>
                        </div>
                    </div>
                </article>
            </li>
        `);

    }
    addModalHandlers(rest);
};

function showModal() {
    const modal = $('.modal');
    modal.addClass('is-active');
};

function addModalHandlers(restaurant) {
    const closeBtn = $('.delete');
    const favBtn = $('#favButton');
    const modalBg = $('.modal-background');
    closeBtn.on('click', () => {
        closeModal();
    });
    modalBg.on('click', (event) => {
        event.stopPropagation();
        closeModal();
    })
    favBtn.on('click', () => {
        const favInfo = {id: restaurant.id, name: restaurant.name};
        let found = checkFav(favInfo.id)
        if (found === false) 
        {
            savedPlaces.push(favInfo);
            favBtn.remove();
            $('.modal-card-foot').append(`<p id="successText">Saved to favorites!</p>`);
            setLocalStorage();
            generateSidebarList();
        }
    });
};

function checkFav(id) {
    for (let i = 0; i < savedPlaces.length; i++) 
    {
        if (savedPlaces[i].id === id)
        {
            return true;
        }
    }
    return false;
}

function checkFavButton(id) {
    for (let i = 0; i < savedPlaces.length; i++) 
    {
        if (savedPlaces[i].id === id)
        {
            return '<p id="successText">Saved to favorites!</p>';
        }
    }
    return '<button class="button is-success" id="favButton">Save to Favorites</button>';
}

// Function to generate list items in the sidebar
function generateSidebarList() {
    const $sidebarList = $('#sidebar-list');
      $sidebarList.empty();
    // Loop through the items and create list items
    savedPlaces.forEach(savedPlaces => {
      $sidebarList.append(`<li class= 'menu-list-item' data-place='${savedPlaces.id}'><button class= 'menu-delete-btn'> X </button>${savedPlaces.name}</li>`); // Append the <li> to the <ul>
    });
    const li = $('.menu-list-item');
    li.on("click",(event) => {
      favoritesAddhandle(event);
    })
  }
  
function favoritesAddhandle(event) {
    event.stopPropagation();
    const targFav = $(event.target);
    if (targFav.get(0).nodeName === "BUTTON")
    {
        deleteFav(event);
    } 
    else if (targFav.get(0).nodeName === "LI") 
    {
        getModalInfo(targFav.attr('data-place'));
    }
      
  }
  
function deleteFav(event) {
    const delBut = $(event.target);
    const delLI = delBut.closest('LI');
    const idDel = delLI.attr('data-place');
    for(i = 0; i < savedPlaces.length; i++) 
    {
        if(savedPlaces[i].id === idDel) 
        {
            savedPlaces.splice(i, 1);
            delLI.remove();
            setLocalStorage();
        }
    }
  }

function setLocalStorage() {
    localStorage.setItem('places', JSON.stringify(savedPlaces));
};

function closeModal() {
    const modal = $('.modal');
    modal.remove();
};

//function that runs on document load, adds event listeners to our search button
$(document).ready(() => {
    
    if (storedPlaces !== null)
    {
        savedPlaces = storedPlaces;
    }
    const goBtn = $('.goBtn');
    goBtn.on('click', () => {
        const input = search.val();
        if (input !== '') 
        {
            handleSearchClick(input);
        }
        else
        {
            searchDiv?.append(`
            <p id="errorText">Type something first!`);
            search.val('');
            setTimeout(() => {
                const text = $('#errorText');
                text.remove();
            }, 1000);
        }
    })
    generateSidebarList();
});