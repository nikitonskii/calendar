'use strict';

import multiselect from './modules/multiselect';

window.addEventListener('DOMContentLoaded', () => {

	let eventsArr = [];
	let eventsKeys = [];
	let sure = false;
	let closeTrigger = null;

	const acceptBtn = document.querySelector('.accept'),
		rejectBtn = document.querySelector('.reject'),
		modalWindow = document.querySelector('.modal'),
		modalHeader = document.querySelector('.modal__header'),
		participants = document.querySelector('[data-multi-select-plugin]');


	class Event {
		constructor(id, name, participants, date) {
			this.id = id;
			this.name = name;
			this.participants = participants;
			this.date = date;
		}
	}

	class Meeting {
		constructor(id, name, participants) {
			this.id = id;
			this.name = name;
			this.participants = participants;
		}

		render() {
			getEvent();
			const parentCell = document.querySelector(`#${this.id}`);
			const eventContainer = document.createElement('div');
			eventContainer.classList.add('meeting');
			eventContainer.innerHTML = `
					<div class="${this.id}" data-close>&times;</div>
					<p class="${this.id + 'goal'}">${this.name}</p>
				`;
			parentCell.append(eventContainer);
			console.log('works');

			closeTrigger = document.querySelectorAll('[data-close]');
			closeTrigger.forEach(item => {
				item.addEventListener('click', (e) => {
					deleteEvent(e);
				})
			})
		}
	}
	// get event from localstorage and push it in arrays
	function getEvent() {
		eventsArr = [];
		eventsKeys = [];

		for (let i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i);
			eventsKeys.push(key);
			let obj = JSON.parse(localStorage.getItem(key));
			eventsArr.push(new Meeting(obj.id, obj.name, obj.participants));
		}
	}
	// get selected participants
	function getParticipants(participants) {
		const persons = [];

		participants.forEach(person => {
			person.hasAttribute('selected') ? persons.push(person.value) : null
		});

		return persons;
	}
	// push event title to confirmation dialog window
	function pushEventName(selector) {
		const transformedSelector = selector + 'goal';
		const meetingGoal = document.querySelector(`.${transformedSelector}`);
		modalHeader.innerHTML = `
			<div class="modal__header">
				<h3>Are you sure? You want to delete this meeting ( ${meetingGoal.innerHTML} )</h3>
			</div>	
		`;
	}

	function deleteEvent(e) {
		let target = e.target.classList.value;

		pushEventName(e.target.classList.value);
		modalWindow.classList.remove('hide');

		acceptBtn.addEventListener('click', () => {
			sure = true;

			if (eventsKeys.includes(target) && sure) {
				localStorage.removeItem(target);
				modalWindow.classList.add('hide');
				cleanCells();
				getEvent();
				renderAll();

			} else sure = false;

		});

		rejectBtn.addEventListener('click', () => {
			target = null;
			sure = false;
			modalWindow.classList.add('hide');
		});
	}


	function cleanCells() {
		document.querySelectorAll('.meeting').forEach(item => {
			item.remove();
		});
	}


	function renderAll() {
		getEvent();
		eventsArr.forEach(item => item.render());
	}

	if (window.location.pathname === '/calendar/' || window.location.pathname.indexOf('index.html') > -1) {
		// initialize calendar object and render event cells
		console.log('its calendar');

		multiselect();
		renderAll();

		const newEventBtn = document.querySelector('.btn__new');
		newEventBtn.addEventListener('click', () => {
			window.location.pathname = '/calendar/create-event.html';
		});

		function filterEvents() {
			let members = getParticipants(participants);
			console.log(members);

			cleanCells();
			eventsArr.forEach(item => {
				if (found(item.participants, members)) {
					item.render();
				}
			});
			if (members.length === 0) {
				cleanCells();
				renderAll();
			}
		}

		function found(arr, arr2) {
			return arr.some(r => arr2.indexOf(r) >= 0);
		}

		document.addEventListener('test', filterEvents);
		document.addEventListener('check', filterEvents);

	}

	if (window.location.pathname.indexOf('create-event.html') > -1) {
		// initialize eventCreator object and wait for user actions
		console.log('its create-event');

		multiselect();
		getEvent();

		const eventName = document.querySelector('.event__goal'),
			participants = document.querySelector('[data-multi-select-plugin]'),
			eventDay = document.querySelector('#days'),
			eventTime = document.querySelector('#time'),
			eventBtn = document.querySelector('.event__btn'),
			rejectBtn = document.querySelector('.btn__reject'),
			alertModal = document.querySelector('.alert'),
			validationName = document.querySelector('.error__name'),
			validationMember = document.querySelector('.error__member'),
			closeModal = document.querySelector('.modal__close');

		// validation for inputs
		function checkInputs(name, selector) {
			if (name.value !== '') {
				selector.classList.add('hide');
				return sure = true;
			}
			selector.classList.remove('hide');
			return sure = false;
		}

		eventName.addEventListener('input', (e) => {
			if (e.target.value !== '') {
				validationName.classList.add('hide');
			} else {
				validationName.classList.remove('hide');
			}
		});

		document.querySelector('.multi-select-component').addEventListener('click', (e) => {
			if (e.target.value !== '') {
				validationMember.classList.add('hide');
			} else {
				validationMember.classList.remove('hide');
			}
		});

		function createEventData(e) {
			e.preventDefault();
			const eventId = eventDay.value + eventTime.value;

			checkInputs(eventName, validationName);
			checkInputs(participants, validationMember);

			if (!eventsKeys.includes(eventId) && sure) {
				const meeting = JSON.stringify(
					new Event(eventId, eventName.value, getParticipants(participants), eventTime.value)
				);
				localStorage.setItem(`${eventId}`, meeting);
				window.location.pathname = '/calendar/index.html';

			} else {
				alertModal.classList.remove('hide');
			}
		}

		closeModal.addEventListener('click', () => {
			alertModal.classList.add('hide');
		});
		rejectBtn.addEventListener('click', () => {
			window.location.pathname = '/calendar/index.html';
		});
		eventBtn.addEventListener('click', (e) => createEventData(e));

	} else {
		// 404 no such page
	}

});

