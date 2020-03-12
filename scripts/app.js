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

const raidApp = 
{
  selectedLocations: {},
  addDialogContainer: document.getElementById('addDialogContainer'),
};

/********** Notification ********************/
const SERVICE_WORKER = '/service-worker.js';

//const SERVEUR_URL = 'http://localhost:3000';
const SERVEUR_URL = 'https://expresstestapp.azurewebsites.net';

const check = () => 
{
	if (!("serviceWorker" in navigator)) 
	{
		throw new Error("[Apps] Service Worker not supported");
	}
	if (!("PushManager" in window)) 
	{
		document.getElementById('info-notification-ko').removeAttribute('hidden');
		throw new Error("[Apps] Push API not supported");
	}
	console.log('[Apps] Service Worker checked');
};
  
const registerServiceWorker = async () => 
{
	const swRegistration = await navigator.serviceWorker.register(SERVICE_WORKER);

	console.log('[Apps] Service Worker registrated');

	return swRegistration;
};
  
const requestNotificationPermission = async () => 
{
	const permission = await window.Notification.requestPermission();
	console.log('[Apps] Notification permission requested');
	// value of permission can be 'granted', 'default', 'denied'
	// granted: user has accepted the request
	// default: user has dismissed the notification permission popup by clicking on x
	// denied: user has denied the request.
	if (permission !== "granted") 
	{
		//throw new Error("Permission not granted for Notification");

		if (Notification.permission === 'denied') 
		{
			document.getElementById('info-notification-ko').removeAttribute('hidden');
			document.getElementById('info-notification-ko').innerHTML = 'Notification désactivée. <br>Pour les réactiver, modifier les paramètres du site dans le navigateur'
		}
	}
};
  
// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => 
{
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) 
	{
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}


/***********************************************/

/**
 * Toggles the visibility of the add raid dialog box.
 */
function toggleAddDialog() 
{
	raidApp.addDialogContainer.classList.toggle('visible');
}

/**
 * Event handler for butDialogAdd, adds the selected raid to the list.
 */
function addLocation() 
{
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

	// Create a new card 
	const card = getRaidCard(raid);

	//& get the weather data from the server
	//getRaidFromNetwork(geo).then((forecast) => {
	//  renderForecast(card, forecast);
	//});

	renderRaid(card, raid);

	const id = raid.geo + raid.date + raid.heureLancement;

	// Save the updated list of selected raid.
	raidApp.selectedLocations[id] = raid;
	saveRaidList(raidApp.selectedLocations);

	document.getElementById('main').scrollTop = document.getElementById('main').scrollHeight + 100 ;
}

/**
 * Creation date dd/mm/yyyy
 */
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
	card.querySelector('.arene').textContent     = "Arène : " + raid.arene;
    card.querySelector('.heureRaid').textContent = "Heure de lancement : " + raid.heureLancement;
	card.querySelector('.geo').textContent       = "Coordonnée : " + raid.geo ;
	card.querySelector('.lien').href             = "http://www.google.com/maps/place/"+raid.geo ;
	card.querySelector('.niveau').textContent    = "Raid Niveau " + raid.niveau ;
	
	var iconRaid = card.querySelector('.icon-raid') ;
	
	if ( iconRaid != null )
	{
		card.querySelector('.icon-raid').className   = `icon raid${raid.niveau}`;
	}
	else
	{
		card.querySelector('.icon').className = `icon raid${raid.niveau}`;
	}
	
	// If the loading spinner is still visible, remove it.
	const spinner = card.querySelector('.card-spinner');
	if (spinner) {
		card.removeChild(spinner);
	}
}

/**
 * Event handler for .remove-raid, removes a raid from the list.
 *
 * @param {Event} evt
 */
function removeRaid(evt) 
{
	const parent = evt.srcElement.parentElement.parentElement.parentElement;
	parent.remove();
	if (raidApp.selectedLocations[parent.id]) 
	{
		delete raidApp.selectedLocations[parent.id];
		saveRaidList(raidApp.selectedLocations);
	}
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getRaidFromNetwork() 
{
	/*var retour = fetch(SERVEUR_URL+'/send-notification')
	.then
	(	
		(response) => {	return response.json(); } 
	)
	.catch
	( 
		() => { return null; } 
	);  
	  
	return retour ;*/
	
	// A COMPLETER
}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} raid Raid object
 * @return {Element} The element for the raid
 */
function getRaidCard(raid) 
{
	const id = raid.geo + raid.date + raid.heureLancement;
	const card = document.getElementById(id);
	if (card) 
	{
		return card;
	}
	const newCard = document.getElementById('raid-template').cloneNode(true);
	newCard.setAttribute('id', id);
	newCard.querySelector('.remove-raid').addEventListener('click', removeRaid);
	document.querySelector('main').appendChild(newCard);
	newCard.removeAttribute('hidden');
	return newCard;

	//Pour info
	//newCard.querySelector('.location').textContent = newCard.querySelector('.location').textContent + raid.arene;
	//newCard.querySelector('.heureRaid').textContent = newCard.querySelector('.heureRaid').textContent + raid.heureLancement;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() 
{
	Object.keys(raidApp.selectedLocations).forEach((key) => 
	{
		const raid = raidApp.selectedLocations[key];
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
function saveRaidList(locations) 
{
	const data = JSON.stringify(locations);
	localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadRaidList() 
{
	let locations = localStorage.getItem('locationList');
	if (locations) 
	{
		try 
		{
		locations = JSON.parse(locations);
		} 
		catch (ex) 
		{
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
 * Initialize the app, gets the list of raid from local storage, then
 * renders the initial data.
 */
function init() 
{
	// Get the raid list, and update the UI.
	raidApp.selectedLocations = loadRaidList();
	updateData();

	// Set up the event handlers for all of the buttons.
	document.getElementById('butRefresh').addEventListener('click', updateData);
	document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogCancel').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogAdd').addEventListener('click', addLocation);

	//Chargement de la liste des arènes
	$.getJSON("/files/listeArene.json", function(listeArene) 
	{
		//console.log(listeArene); // this will show the info it in firebug console
		$.each( listeArene.data, function( key, val ) 
		{
			document.getElementById('selectRaidToAdd').add(new Option(val.name, val.value))
		});		
	})
}

const main = async () => 
{
	check();
	const permission = await requestNotificationPermission();
	const swRegistration = await registerServiceWorker();	
};

main();
init();
