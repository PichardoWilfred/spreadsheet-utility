<template>
    <div class="flex items-center justify-center w-full" ref="file_container" @ondrop="catch_file">
        <label :for="file_input_id"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 
        dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-all"
            :class="{ 'dark:border-gray-300 dark:bg-gray-800': file_dragged }">
            <div v-if="data_uploaded.length">
                this is the content <br>
                {{ data_uploaded }}
            </div>
            <div v-else class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="none"
                    viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">SVG, PNG, JPG or GIF (800 x 400px)</p>
            </div>
            <input :id="file_input_id" type="file" class="hidden" @change="file_uploaded" />
        </label>
    </div>
</template>

<script setup>
const props = defineProps(['file_input_id']);
const emit = defineEmits(['process_file']);

const file_container = ref(null);
const file_dragged = ref(false);

const data_uploaded = ref(false);

function isValidFileType(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
}
const catch_file = async (e) => {
    e.preventDefault();
    const files_data  = e.dataTransfer.files;
    
    if (files_data.length) {
        data_uploaded.value = true;

        process_files(files_data);
    }
    
}
function process_files(files) {
    for (const file of files) {
        emit('process_file', file);
        
        file_container.value.files = file;
    }
}
const file_uploaded = (e) => {
    let file = e.target.files[0]
    emit('process_file', file);
    // file_container.value.files = file;
}
onMounted(() => {
    let container = file_container.value;
    container.addEventListener("dragover", (e) => {
        e.preventDefault();
        
        file_dragged.value = true;
    }, true);
    container.addEventListener("dragleave", (e) => {
        e.preventDefault();
        file_dragged.value = false;
    }, true);
    container.addEventListener("drop", catch_file, true)
});
</script>