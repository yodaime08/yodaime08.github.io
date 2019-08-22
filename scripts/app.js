/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

const weatherApp = {
  selectedLocations: {},
  addDialogContainer: document.getElementById('addDialogContainer'),
};

/**
 * Toggles the visibility of the add location dialog box.
 */
function toggleAddDialog() {
  weatherApp.addDialogContainer.classList.toggle('visible');
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
	// Hide the dialog
	toggleAddDialog();

	//Arène
	const select = document.getElementById('selectRaidToAdd');
	const selected = select.options[select.selectedIndex];
	//Position GPS
	const geo = selected.value;
	//Nom de l'arène
	const arene = selected.textContent;

	//Heure du Raid
	const clock =  document.getElementById('clockpicker');
	const heureLancement = clock.value;

	//Niveau du Raid
	const selectLevel = document.getElementById('levelRaidToAdd');
	const selectedLevel = selectLevel.options[selectLevel.selectedIndex];
	const valueLevel = selectedLevel.value;

	var date = getDate()

	const raid = {arene: arene, geo: geo, heureLancement:heureLancement, niveau:valueLevel, date:date};

	// Create a new card & get the weather data from the server
	const card = getRaidCard(raid);
	//getRaidFromNetwork(geo).then((forecast) => {
	//  renderForecast(card, forecast);
	//});
	renderRaid(card, raid);

	const id = raid.geo + raid.date + raid.heureLancement;

	// Save the updated list of selected cities.
	weatherApp.selectedLocations[id] = raid;
	saveLocationList(weatherApp.selectedLocations);

	document.getElementById('main').scrollTop = document.getElementById('main').scrollHeight + 100 ;
}

function getDate()
{
	var today = new Date(); 
	var dd = today.getDate(); 
	var mm = today.getMonth()+1; 
	//January is 0! 
	var yyyy = today.getFullYear(); 
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} 
	var today = dd+'/'+mm+'/'+yyyy;
	
	return today ;
}

function renderRaid(card, raid) 
{
	card.querySelector('.arene').textContent  = "Arène : " + raid.arene;
    card.querySelector('.heureRaid').textContent = "Heure de lancement : " + raid.heureLancement;
	card.querySelector('.geo').textContent       = "Coordonnée : " + raid.geo ;
	
	card.querySelector('.niveau-raid .icon-raid').className = `icon raid${raid.niveau}`;
	
	card.querySelector('.lien').href = "http://www.google.com/maps/place/"+raid.geo ;
	
	card.querySelector('.niveau').textContent = "Raid Niveau " + raid.niveau ;
	
	// If the loading spinner is still visible, remove it.
	const spinner = card.querySelector('.card-spinner');
	if (spinner) {
		card.removeChild(spinner);
	}
}

/**
 * Event handler for .remove-raid, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  if (weatherApp.selectedLocations[parent.id]) {
    delete weatherApp.selectedLocations[parent.id];
    saveLocationList(weatherApp.selectedLocations);
  }
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
/* 
function renderForecast(card, data) {
  if (!data) {
    // There's no data, skip the update.
    return;
  }

  // Find out when the element was last updated.
  const cardLastUpdatedElem = card.querySelector('.card-last-updated');
  const cardLastUpdated = cardLastUpdatedElem.textContent;
  const lastUpdated = parseInt(cardLastUpdated);

  // If the data on the element is newer, skip the update.
  if (lastUpdated >= data.currently.time) {
    return;
  }
  cardLastUpdatedElem.textContent = data.currently.time;

  // Render the forecast data into the card.
  //card.querySelector('.description').textContent = data.currently.summary;
  card.querySelector('.geo').textContent = card.querySelector('.geo').textContent + data.latitude + "  " + data.longitude;
  //const forecastFrom = luxon.DateTime
  //    .fromSeconds(data.currently.time)
  //    .setZone(data.timezone)
  //    .toFormat('DDDD t');
  //card.querySelector('.date').textContent = forecastFrom;
  card.querySelector('.niveau-raid .icon-raid').className = `icon ${data.currently.icon}`;
  card.querySelector('.niveau-raid .value').textContent = data.niveau ;
  //card.querySelector('.current .icon')
      //.className = `icon ${data.currently.icon}`;
  //card.querySelector('.current .temperature .value')
      //.textContent = Math.round(data.currently.temperature);
  //card.querySelector('.current .humidity .value')
      //.textContent = Math.round(data.currently.humidity * 100);
  //card.querySelector('.current .wind .value')
      //.textContent = Math.round(data.currently.windSpeed);
  //card.querySelector('.current .wind .direction')
      //.textContent = Math.round(data.currently.windBearing);
  /*const sunrise = luxon.DateTime
      .fromSeconds(data.daily.data[0].sunriseTime)
      .setZone(data.timezone)
      .toFormat('t');
  card.querySelector('.current .sunrise .value').textContent = sunrise;
  const sunset = luxon.DateTime
      .fromSeconds(data.daily.data[0].sunsetTime)
      .setZone(data.timezone)
      .toFormat('t');
  card.querySelector('.current .sunset .value').textContent = sunset;

  // Render the next 7 days.
  const futureTiles = card.querySelectorAll('.future .oneday');
  futureTiles.forEach((tile, index) => {
    const forecast = data.daily.data[index + 1];
    const forecastFor = luxon.DateTime
        .fromSeconds(forecast.time)
        .setZone(data.timezone)
        .toFormat('ccc');
    tile.querySelector('.date').textContent = forecastFor;
    tile.querySelector('.icon').className = `icon ${forecast.icon}`;
    tile.querySelector('.temp-high .value')
        .textContent = Math.round(forecast.temperatureHigh);
    tile.querySelector('.temp-low .value')
        .textContent = Math.round(forecast.temperatureLow);
  });

  // If the loading spinner is still visible, remove it.
  const spinner = card.querySelector('.card-spinner');
  if (spinner) {
    card.removeChild(spinner);
  }
}
*/


/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getRaidFromNetwork(coords) 
{
	var retour = fetch(`/forecast/${coords}`)
	.then
	(	
		(response) => {	return response.json(); } 
	)
	.catch
	( 
		() => { return null; } 
	);  
	  
	return retour ;
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
  // CODELAB: Add code to get weather forecast from the caches object.

}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getRaidCard(raid) {
  const id = raid.geo + raid.date + raid.heureLancement;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.getElementById('raid-template').cloneNode(true);
  //newCard.querySelector('.location').textContent = newCard.querySelector('.location').textContent + raid.arene;
  //newCard.querySelector('.heureRaid').textContent = newCard.querySelector('.heureRaid').textContent + raid.heureLancement;
  newCard.setAttribute('id', id);
  newCard.querySelector('.remove-raid').addEventListener('click', removeLocation);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
	Object.keys(weatherApp.selectedLocations).forEach((key) => {
		const raid = weatherApp.selectedLocations[key];
		const card = getRaidCard(raid);
		// CODELAB: Add code to call getForecastFromCache

		// Get the forecast data from the network.
		//getRaidFromNetwork(location.geo).then((forecast) => {
		//renderForecast(card, forecast);
		//});
		renderRaid(card, raid) 
	});
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  
  //Génère une liste vide pour éviter les plantages
  if (!locations || Object.keys(locations).length === 0) 
  {
    locations = {};
  }
  
  return locations;
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
	// Get the location list, and update the UI.
	weatherApp.selectedLocations = loadLocationList();
	updateData();

	// Set up the event handlers for all of the buttons.
	document.getElementById('butRefresh').addEventListener('click', updateData);
	document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogCancel').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogAdd').addEventListener('click', addLocation);

	//Chargement de la liste des arènes
	$.getJSON("/files/listeArene.json", function(listeArene) {
		console.log(listeArene); // this will show the info it in firebug console
		
		 $.each( listeArene.data, function( key, val ) {
			document.getElementById('selectRaidToAdd').add(new Option(val.name, val.value))
		  });		
	});
}

init();
