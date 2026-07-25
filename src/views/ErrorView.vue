<template>
  <main
    class="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 text-center"
  >
    <!-- Contenedor de la imagen con tamaño controlado -->
    <div class="image-container-404 w-full max-w-3xl mx-auto">
      <img
        class="w-full h-auto rounded-3xl"
        src="https://i.postimg.cc/DZCNJgYX/404.avif"
        alt="Ilustración Error 404 - Página no encontrada"
      />
    </div>

    <!-- Título y mensaje -->
    <h1 class="text-3xl md:text-4xl mt-5 font-extrabold text-gray-900 tracking-tight">
      ¡Ups! Página no encontrada
    </h1>
    <p class="mt-2 text-base md:text-lg text-gray-600 max-w-md">
      La página que buscas no está disponible, fue movida o el enlace es incorrecto.
    </p>

    <!-- Enlace de retorno optimizado (Router-link con diseño de botón) -->
    <router-link
      :to="{ name: 'home' }"
      class="mt-8 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
    >
      <i class="bi bi-house-door mr-2 text-lg"></i>
      Volver al Inicio
    </router-link>
  </main>
</template>
