const ROOMS = [
  {
    id: "ruzafa",
    name: "Sala Ruzafa",
    equipment: ["Pizarra", "Proyector"],
    commons: "Cafetería en la misma planta",
    price: 18,
  },
  {
    id: "carmen",
    name: "Sala Carmen",
    equipment: ["4 ordenadores", "Pizarra"],
    commons: "Office con nevera",
    price: 24,
  },
  {
    id: "cabanyal",
    name: "Sala Cabanyal",
    equipment: ["Proyector", "Pizarra"],
    commons: "Zona común junto a la entrada",
    price: 20,
  },
];

const STORAGE_KEY = "colab.reservas.v1";
const TWO_HOURS = 2 * 60 * 60 * 1000;
const ZONE = "Europe/Madrid";

const state = {
  reservations: loadReservations(),
  slots: buildSlots(),
  selected: null,
  view: "reservar",
};

const roomsEl = document.querySelector("#rooms");
const form = document.querySelector("#book-form");
const bookerInput = document.querySelector("#booker");
const peopleInput = document.querySelector("#people");
const summaryEl = document.querySelector("#selection-summary");
const formError = document.querySelector("#form-error");
const formOk = document.querySelector("#form-ok");
const submitBtn = document.querySelector("#book-submit");
const agendaEl = document.querySelector("#agenda");
const agendaMessage = document.querySelector("#agenda-message");
const agendaQuery = document.querySelector("#agenda-query");
const viewReservar = document.querySelector("#view-reservar");
const viewAgenda = document.querySelector("#view-agenda");

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

form.addEventListener("submit", onSubmit);
agendaQuery.addEventListener("input", renderAgenda);

render();

function loadReservations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReservation);
  } catch {
    return [];
  }
}

function isReservation(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.roomId === "string" &&
    typeof item.start === "string" &&
    typeof item.booker === "string" &&
    Number.isInteger(item.people) &&
    typeof item.price === "number"
  );
}

function saveReservations() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reservations));
    return true;
  } catch {
    return false;
  }
}

function buildSlots() {
  const now = Date.now();
  const stamps = new Set();

  const add = (date) => {
    date.setSeconds(0, 0);
    if (date.getTime() <= now + 60 * 1000) return;
    stamps.add(date.toISOString());
  };

  for (let day = 0; day < 3; day += 1) {
    for (const hour of [9, 11, 13, 16, 18]) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(hour, 0, 0, 0);
      add(date);
    }
  }

  const soon = new Date(now + 75 * 60 * 1000);
  soon.setMinutes(Math.ceil(soon.getMinutes() / 5) * 5, 0, 0);
  add(soon);

  return [...stamps].sort();
}

function roomById(id) {
  return ROOMS.find((room) => room.id === id);
}

function reservationFor(roomId, start) {
  return state.reservations.find((item) => item.roomId === roomId && item.start === start);
}

function canRelease(start) {
  const when = new Date(start).getTime();
  return Number.isFinite(when) && when - Date.now() >= TWO_HOURS;
}

function formatDay(iso) {
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZONE,
  }).format(new Date(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(iso) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONE,
  }).format(new Date(iso));
}

function dayKey(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ZONE,
  }).format(new Date(iso));
}

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function euros(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function showView(view) {
  state.view = view;
  viewReservar.hidden = view !== "reservar";
  viewAgenda.hidden = view !== "agenda";
  document.querySelectorAll(".nav-btn").forEach((button) => {
    if (button.dataset.view === view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (view === "agenda") renderAgenda();
}

function render() {
  renderRooms();
  renderSelection();
  renderAgenda();
}

function renderRooms() {
  clearNode(roomsEl);
  ROOMS.forEach((room) => {
    const card = document.createElement("article");
    card.className = "room";

    const head = document.createElement("div");
    head.className = "room-head";
    const title = document.createElement("h2");
    title.textContent = room.name;
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `${euros(room.price)} / hora`;
    head.append(title, price);

    const tags = document.createElement("ul");
    tags.className = "tags";
    room.equipment.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      tags.append(li);
    });

    const commons = document.createElement("p");
    commons.className = "commons";
    commons.textContent = room.commons;

    card.append(head, tags, commons);

    const byDay = new Map();
    state.slots.forEach((start) => {
      const key = dayKey(start);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(start);
    });

    byDay.forEach((starts) => {
      const label = document.createElement("p");
      label.className = "day-label";
      label.textContent = formatDay(starts[0]);
      const slots = document.createElement("div");
      slots.className = "slots";
      starts.forEach((start) => slots.append(slotButton(room, start)));
      card.append(label, slots);
    });

    roomsEl.append(card);
  });
}

function slotButton(room, start) {
  const taken = reservationFor(room.id, start);
  const selected =
    state.selected && state.selected.roomId === room.id && state.selected.start === start;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "slot";
  if (selected) button.classList.add("selected");

  const time = document.createElement("span");
  time.textContent = formatTime(start);
  const status = document.createElement("small");

  if (taken) {
    button.disabled = true;
    status.textContent = "Ocupada";
    button.setAttribute("aria-label", `${room.name}, ${formatDay(start)} a las ${formatTime(start)}, ocupada`);
  } else if (selected) {
    status.textContent = "Elegida";
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", `${room.name}, ${formatDay(start)} a las ${formatTime(start)}, elegida`);
  } else {
    status.textContent = "Libre";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${room.name}, ${formatDay(start)} a las ${formatTime(start)}, libre`);
  }

  button.append(time, status);
  if (!taken) {
    button.addEventListener("click", () => {
      state.selected = { roomId: room.id, start };
      formError.textContent = "";
      formOk.textContent = "";
      render();
    });
  }
  return button;
}

function renderSelection() {
  const room = state.selected ? roomById(state.selected.roomId) : null;
  if (!room) {
    summaryEl.textContent = "Elegid una franja marcada como Libre.";
    submitBtn.disabled = true;
    return;
  }
  summaryEl.textContent = `${room.name}, ${formatDay(state.selected.start)} a las ${formatTime(state.selected.start)}. Quedaría retenido ${euros(room.price)}.`;
  submitBtn.disabled = false;
}

function onSubmit(event) {
  event.preventDefault();
  formError.textContent = "";
  formOk.textContent = "";

  const room = state.selected ? roomById(state.selected.roomId) : null;
  if (!room) {
    formError.textContent = "Elegid una franja libre antes de reservar.";
    return;
  }

  const booker = bookerInput.value.trim();
  const people = Number(peopleInput.value);
  if (!booker) {
    formError.textContent = "Escribid el nombre de quien reserva.";
    bookerInput.focus();
    return;
  }
  if (!Number.isInteger(people) || people < 4) {
    formError.textContent = "El grupo tiene que ser de al menos 4 personas.";
    peopleInput.focus();
    return;
  }
  if (new Date(state.selected.start).getTime() <= Date.now()) {
    formError.textContent = "Esa franja ya ha pasado. Elegid otra.";
    return;
  }
  if (reservationFor(room.id, state.selected.start)) {
    formError.textContent = "Esa franja ya está ocupada. Elegid otra hora.";
    state.selected = null;
    render();
    return;
  }

  state.reservations.push({
    id: newId(),
    roomId: room.id,
    start: state.selected.start,
    booker,
    people,
    price: room.price,
  });

  if (!saveReservations()) {
    state.reservations.pop();
    formError.textContent = "No se pudo guardar la reserva en este navegador.";
    return;
  }

  formOk.textContent = `Reserva guardada para ${booker}. ${room.name}, ${formatDay(state.selected.start)} a las ${formatTime(state.selected.start)}. Quedaría retenido ${euros(room.price)}. No hay cobro real.`;
  bookerInput.value = "";
  peopleInput.value = "";
  state.selected = null;
  render();
}

function renderAgenda() {
  clearNode(agendaEl);
  const query = agendaQuery.value.trim().toLowerCase();
  const visible = state.reservations
    .filter((item) => item.booker.toLowerCase().includes(query))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = query
      ? "Ninguna reserva coincide con ese nombre."
      : "Todavía no hay reservas. Elegid una sala y una franja libre.";
    agendaEl.append(empty);
    return;
  }

  const groups = new Map();
  visible.forEach((item) => {
    const key = dayKey(item.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  groups.forEach((items) => {
    const section = document.createElement("section");
    section.className = "day";
    const title = document.createElement("h2");
    title.textContent = formatDay(items[0].start);
    section.append(title);
    items.forEach((item) => section.append(agendaRow(item)));
    agendaEl.append(section);
  });
}

function agendaRow(item) {
  const room = roomById(item.roomId);
  const row = document.createElement("article");
  row.className = "row";

  const time = document.createElement("time");
  time.dateTime = item.start;
  time.textContent = formatTime(item.start);

  const who = document.createElement("p");
  who.className = "who";
  const name = document.createElement("strong");
  name.textContent = item.booker;
  const detail = document.createElement("span");
  const roomName = room ? room.name : "Sala";
  detail.textContent = `${roomName} · ${item.people} personas · ${euros(item.price)} retenido (simulado)`;
  const note = document.createElement("span");
  note.className = "row-note";
  const open = canRelease(item.start);
  if (open) {
    note.classList.add("calm");
    note.textContent = "Cancelar liberaría la franja. El importe figuraría como devuelto.";
  } else {
    note.classList.add("warn");
    note.textContent = `No se puede cancelar: faltan menos de 2 horas. Se cobraría el total, ${euros(item.price)}. No hay cobro real.`;
  }
  who.append(name, detail, note);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost";
  button.textContent = "Cancelar";
  button.disabled = !open;
  if (open) button.addEventListener("click", () => cancelReservation(item.id));

  row.append(time, who, button);
  return row;
}

function cancelReservation(id) {
  const item = state.reservations.find((entry) => entry.id === id);
  agendaMessage.className = "message";
  if (!item) {
    agendaMessage.classList.add("error");
    agendaMessage.textContent = "Esa reserva ya no está en la agenda.";
    render();
    return;
  }
  if (!canRelease(item.start)) {
    agendaMessage.classList.add("error");
    agendaMessage.textContent = `No se canceló. Faltan menos de 2 horas y se cobraría el total, ${euros(item.price)}.`;
    renderAgenda();
    return;
  }

  const previous = state.reservations.slice();
  state.reservations = state.reservations.filter((entry) => entry.id !== id);
  if (!saveReservations()) {
    state.reservations = previous;
    agendaMessage.classList.add("error");
    agendaMessage.textContent = "No se pudo guardar la cancelación en este navegador.";
    return;
  }

  const room = roomById(item.roomId);
  agendaMessage.classList.add("ok");
  agendaMessage.textContent = `${room ? room.name : "La sala"} a las ${formatTime(item.start)} vuelve a estar libre. El importe retenido figuraría como devuelto.`;
  render();
}
