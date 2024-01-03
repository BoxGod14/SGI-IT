let selectors = document.querySelectorAll("#selectors li");
//Se declara apuntado a userInfo ya que por defecto siempre se mostrara
let object = document.getElementById("userInfo");
// Ejecutar una función para cada elemento li
selectors.forEach(function(selector) {
    // Agregar el evento de clic a cada elemento li
    selector.addEventListener("click", function() {
        // Quitar la clase selected a todos los elementos li
        selectors.forEach(function(otherSelector) {
            otherSelector.classList.remove("selected");
        });    
        // Agregar la clase selected al elemento li que se clicó
        this.classList.add("selected");
        if (object) {
            //En caso de ya existir un objeto(tenia se mostraba) se oculta.
            object.style.display = "none";
        }
        let dataSelector = this.dataset.selector;
        // Buscar el objeto con un id que coincida con el data-selector
        object = document.getElementById(dataSelector);
        //Se muestra el objeto
        object.style.display = "flex";
    });
});