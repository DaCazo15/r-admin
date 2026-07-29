<template>
  <main
    class="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 text-center"
  >
    <div class="image-container-404 flex justify-center items-center -my-12">
      <img src="../assets/img/404.png" alt="Ilustración Error 404 - Página no encontrada" />
    </div>

    <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
      ¡Ups! Página no encontrada
    </h1>
    <p class="mt-1 text-base md:text-lg text-gray-600 max-w-md">
      La página que buscas no está disponible, fue movida o el enlace es incorrecto.
    </p>

    <router-link
      :to="{ name: 'home' }"
      class="mt-5 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
    >
      <i class="bi bi-house-door mr-2 text-lg"></i>
      Volver al Inicio
    </router-link>
  </main>
</template>
