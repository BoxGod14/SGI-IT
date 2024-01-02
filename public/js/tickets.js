let writer = document.querySelector("#writter");
let showWriterButton = document.querySelector("#showWriter");
let messager = document.querySelector('[name="messager"]');
writer.style.display = "none";

showWriterButton.addEventListener("click", showWriter);
document.getElementById("hideWriter").addEventListener("click", hideWriter);
document.getElementById("sendMessage").addEventListener("click", sendMessage);
/**
 * Función para mostrar el sistema de escritura de mensajes
 */
function showWriter() {
  writer.style.display = "flex";
  showWriterButton.style.display = "none";
}
/**
 * Función para ocultar el sistema de escritura de mensajes
 */
function hideWriter() {
  writer.style.display = "none";
  showWriterButton.style.display = "inline";
}

/**
 * Funcion para aumentar la altura de mensaje si fuera necesario
 */
function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + "px";
}
