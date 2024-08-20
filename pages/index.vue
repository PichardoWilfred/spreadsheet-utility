<template>
    <div>
        <main class="max-w-[1020px] mx-auto">
            <section class="p-10">
                <h1 class="font-bold text-4xl">
                    All the leaves are brown
                </h1>
                <p class="font-" style="font-style: italic;">all the leaves are brown...</p>
                <div class="mt-5">
                    <client-only placeholder="loading...">
                        <QuillEditor :options="options" />
                    </client-only>
                </div>
            </section>
        </main>
    </div>
</template>
<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const options = {
    debug: 'info',
        modules: {
            toolbar: ['bold', 'italic', 'underline']
        },
        placeholder: 'Compose an epic...',
        readOnly: true,
        theme: 'snow'
}
// import Quill from 'quill';
// Or if you only need the core build
// import Quill from 'quill/core';


</script>