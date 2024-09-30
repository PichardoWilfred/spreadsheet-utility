<template>
    <main class="max-w-[1020px] mx-auto">
        <section class="p-10">
            <h1 class="font-bold text-4xl text-center">
                DR Tracking Utility
            </h1>
            <p class="text-center" style="font-style: italic;">
                Prototype
            </p>
            <div class="flex flex-col mt-5">
                <UButton :disabled="disabled_standard" @click.prevent="open_file_standard_ETAs_modal"
                color="orange" variant="soft" 
                class="mb-2 ms-auto transition-all">
                    <Icon name="material-symbols:event-upcoming" />
                    Revisar standard ETAs
                </UButton>
                <client-only placeholder="loading...">
                    <QuillEditor ref="editor" :options="editor_options"/>
                </client-only>
                <div class="flex space-x-8">
                    <div class="flex flex-col my-6">
                        <h4 class="text-lg font-bold mb-3">Añadir al correo</h4>
                        <UCheckbox v-model="check_highlighted_changes" class="mb-2" name="notifications" label="Please see the attached spreadsheet..." />
                        <UCheckbox v-model="ask_for_updated_ep_links" name="notifications" label="Would you like to receive updated EP Links" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col mt-5 mb-6">
                <div class="ms-auto my-4">
                    <UButton color="blue" variant="soft" @click.prevent="open_standard_ETA_modal"> 
                        <Icon name="material-symbols:event" />
                        Calcular por dias laborables
                    </UButton>
                </div>
                <div class="pb-5 mb-3 border-b border-gray-700">
                    
                    <h4 class="font-poppins text-3xl font-semibold me-3 mb-5">
                        Configuración
                    </h4>
                    <div class="flex justify-between">
                        <UBadge color="primary" :variant="main_file_style" class="text-lg my-auto">
                            {{ main_file }}
                        </UBadge>
                        <USelect v-model="selected_status" 
                        :options="status_options" class="max-w-[180px]" />
                    </div>
                    <UInput class="mt-5" :value="subject_line_status" color="primary" variant="outline" placeholder="Search..." />
                </div>
            </div>
            <FileInput file_input_id="import_file" class="mt-4" @process_file="process_file"/>
        </section>
        <section class="p-10 pt-2"></section>
    </main>
    <!-- standard_ETA_modal -->
    <UModal v-model="standard_ETA_modal">
        <h4 class="font-poppins text-xl font-semibold m-4 mb-0">
            Calcular dias laborales
        </h4>
        <div class="flex px-4 space-x-3">
            <div class="flex flex-col w-full">
                <div class="flex flex-col justify-center py-4 rounded-[8px]">
                    <div class="flex space-x-3">
                        <div class="flex flex-col p-1 mb-5">
                            <span class="font-bold font-poppins text-[14px] mb-1">
                                Fecha
                            </span>
                            <UPopover :popper="{ placement: 'bottom-start' }">
                                <UButton :label="format_date(from_date)" color="cyan" variant="soft" icon="i-heroicons-calendar-days-20-solid" />
                                <template #panel="{ close }">
                                    <CustomDatePicker v-model="from_date" is-required 
                                    @close="close" />
                                </template>
                            </UPopover>
                        </div>
                        <div class="flex flex-col mb-6">
                            <span class="font-bold font-poppins text-[14px] mb-2">
                                Dias laborables
                            </span>
                            <UInput type="number" v-model="bussiness_days" @blur="count_bussiness_days" />
                        </div>
                    </div>
                    <div class="font-bold font-poppins font-lg p-4 px-0 max-w-[160px]">
                        <div class="flex flex-col">
                            <span class="font-bold font-poppins text-xs mb-3">
                                ETA:
                            </span>
                            <UButton :label="`Copiar `+date_bussiness_days" class="flex justify-center " @click.prevent="copy(date_bussiness_days)" icon="i-heroicons-calendar-days-20-solid"/> 
                        </div>
                </div>
                </div>
                <UAccordion :items="[{ label: 'Standard ETAs', defaultOpen: false, slot: 'standard-etas', icon: 'i-heroicons-calendar-days-20-solid'}]" 
                :ui="{ wrapper: 'flex flex-col w-full' }">
                    <template #standard-etas>
                        <UTable :columns="standard_ETA_columns" :rows="standard_ETAS" :ui="{td: {
                            base: 'whitespace-nowrap',
                            padding: 'p-2 px-4',
                            color: 'text-gray-500 dark:text-gray-400',
                            font: '',
                            size: 'text-sm',
                        }}">
                            <template #state-data="{ row }">
                                <b>{{ row.state }}</b>
                            </template>
                            <template #normal-data="{ row }">
                                <div v-if="row.normal.not_applicable"></div>
                                <div v-else>
                                    <b>{{ row.normal.from }}</b> /
                                    <b>{{ row.normal.to }}</b>
                                </div> 
                            </template>
                            <template #update-data="{ row }">
                                <div v-if="row.update.not_applicable"></div>
                                <div v-else>
                                    <b>{{ row.update.from }}</b> /
                                    <b>{{ row.update.to }}</b>  
                                </div>
                            </template>
                            <template #extensive_search-data="{ row }">
                                <div v-if="row.extensive_search.not_applicable"></div>
                                <div v-else>
                                    <b>{{ row.extensive_search.from }}</b> /
                                    <b>{{ row.extensive_search.to }}</b>  
                                </div>
                            </template>
                        </UTable>
                    </template>
                </UAccordion>
            </div>
        </div>
        <div class="border border-gray-800 mb-4"/>
        <UButton @click.prevent="count_bussiness_days" color="green" class="max-w-[220px] flex justify-center ms-auto mb-5 me-4"> 
            <Icon name="material-symbols:event" />
            Calcular
        </UButton>
    </UModal>
    
    <UModal v-model="file_standard_ETAs_modal" :ui="{width: 'sm:max-w-[820px]'}">
        <div class="flex px-4 py-3 border-b border-gray-800">
            <UBadge color="primary" :variant="main_file_style" class="text-lg my-auto">
                Standard ETAs de <b class="ms-1"> {{ main_file }}</b>
            </UBadge>
        </div>
        <div class="p-4">
            
            <UTable :columns="file_standard_ETA_columns" :rows="standard_ETA_files_rows" :ui="{td: {
                padding: 'p-2 px-4',
            }}">
                <template #filename-date="{ row }">
                    <b>{{ row.filename }}</b>
                </template>
                <template #state-data="{ row }">
                    <b>{{ row.state }}</b>
                </template>
                <template #launch_date-data="{ row }">
                    
                    <UPopover :popper="{ placement: 'bottom-start' }">
                        <UButton :label="format_date(row.launch_date)" color="cyan" variant="soft" 
                        icon="i-heroicons-calendar-days-20-solid" />
                        <template #panel="{ close }">
                            <CustomDatePicker v-model="row.launch_date" is-required 
                            @close="close" />
                        </template>
                    </UPopover>
                </template>
                <template #normal-data="{ row }">
                    <div v-if="row.normal.not_applicable"></div>
                    <UButton v-else @click.prevent="copy_standard_eta_date(row, row.normal)" variant="soft">
                        <b>{{ row.normal.from }}</b> / <b>{{ row.normal.to }}</b>
                    </UButton> 
                </template>
                <template #update-data="{ row }" >
                    <div v-if="row.update.not_applicable"></div>
                    <UButton v-else @click.prevent="copy_standard_eta_date(row, row.update)" variant="soft" color="teal">
                        <b>{{ row.update.from }}</b> / <b>{{ row.update.to }}</b>  
                    </UButton>
                </template>
                <template #extensive_search-data="{ row }">
                    <div v-if="row.extensive_search.not_applicable"></div>
                    <UButton v-else @click.prevent="copy_standard_eta_date(row, row.extensive_search)" variant="soft" color="cyan">
                        <b>{{ row.extensive_search.from }}</b> / <b>{{ row.extensive_search.to }}</b>  
                    </UButton>
                </template>
            </UTable>
        </div>
    </UModal>
</template>
<script setup>

import exceljs from "exceljs";
import businessDays from "business-days-js";
import { format } from 'date-fns';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const editor_options = {
    modules: {
        toolbar: ['bold', 'italic', 'underline']
    },
    placeholder: 'Compose an epic...',
    theme: 'snow'
}

const editor = ref(null);

const check_highlighted_changes = ref(true);
const ask_for_updated_ep_links = ref(true);
const main_file = ref('MAIN_FILE_NAME');
const main_file_style = ref('papo')

const status_options = ['Status', 'Updates', 'Additional Sites']
const selected_status = ref(status_options[0]);

const subject_line_status = computed(() => {
    let status = {
        Status: `NCS ***${main_file.value}*** Status Report`,
        Updates: `NCS ***${main_file.value}*** Update Status Report`,
        'Additional Sites': `NCS ***${main_file.value}*** Additional Sites Status Report`,
    }
    return status[selected_status.value];
});


const standard_ETA_files_rows = ref([]);

const file_standard_ETA_columns = [
    { label: 'Filename', key: 'filename'},
    { label: 'Fecha de Inicio', key: 'launch_date'},
    { label: 'State', key: 'state' }, 
    { label: 'Normal', key: 'normal' }, 
    { label: 'Update', key: 'update' },
    { label: 'Extensive Search', key: 'extensive_search' },
];
const copy_standard_eta_date = (row, parameters) => {
    const from_date = useDateFormatted(business_days_utility.addDays(row.launch_date, (parameters.from - 1)).$d, 'simple-slash');
    const to_date = useDateFormatted(business_days_utility.addDays(row.launch_date, (parameters.to - 1)).$d, 'simple-slash');

    let standard_ETA_copy = `Standard ETA ${from_date} - ${to_date}`
    copy(standard_ETA_copy);
}
const process_file = async (file) => {
    const { project_name, excel_data, files, standard_ETA_files } = await useProject(file); // the file will be fully proced
    const { target_editor } = useEditor(editor.value, files, check_highlighted_changes.value, ask_for_updated_ep_links.value);
    
    main_file.value = project_name.value;
    main_file_style.value = 'soft';

    if (standard_ETA_files.length) {
        disabled_standard.value = false;
        standard_ETA_files_rows.value = standard_ETA_files.map((file) => {
            const state_found = standard_ETAS.find(({state}) => state === file.local_office_state);
            return {
                filename: file.filename,
                state: file.local_office_state,
                update: {...state_found.update}, 
                normal: {...state_found.normal },
                extensive_search: { ...state_found.extensive_search },
                launch_date: new Date(),
            }
        });
        
    }else {
        disabled_standard.value = true;
    }
}

const disabled_standard = ref(true);
const file_standard_ETAs_modal = ref(false);
const open_file_standard_ETAs_modal = () => {
    file_standard_ETAs_modal.value = true;
}
const close_file_standard_ETAs_modal = () => {
    file_standard_ETAs_modal.value = false;
}

const standard_ETA_modal = ref(false);
const open_standard_ETA_modal = () => {
    standard_ETA_modal.value = true;
}

const business_days_utility = businessDays({state: "pa"});
const from_date = ref( new Date() );
const bussiness_days = ref(0);
const date_bussiness_days = ref(useDateFormatted(new Date(), 'simple-slash'));

const format_date = (date) => {
    const formatted_Date = useDateFormatted(date);
    return formatted_Date;
};

const count_bussiness_days = () => {
    let standard_ETA = business_days_utility.addDays(from_date.value, (bussiness_days.value));
    const date_ = useDateFormatted(standard_ETA.$d, 'simple-slash');
    date_bussiness_days.value = date_; 
    copy(date_);
}

const standard_ETAS = [
    {
        state: 'CA',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 12, to: 15, not_applicable: true }
    },
    {
        state: 'WA',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 12, to: 15, not_applicable: true }
    },
    {
        state: 'OR',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 12, to: 15, not_applicable: true }
    },
    {
        state: 'HI',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 12, to: 15, not_applicable: true }
    },
    {
        state: 'AZ',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
    {
        state: 'NV',
        normal: { from: 4, to: 5 },
        update: { from: 1, to: 2},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
    {
        state: 'TX',
        normal: { from: 10, to: 15 },
        update: { from: 1, to: 2},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
    {
        state: 'FL',
        normal: { from: 5, to: 7 },
        update: { from: 1, to: 1, not_applicable: true},
        extensive_search: { from: 12, to: 15 }
    },
    {
        state: 'IL',
        normal: { from: 9, to: 1 },
        update: { from: 1, to: 1, not_applicable: true},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
    {
        state: 'IN',
        normal: { from: 9, to: 1 },
        update: { from: 1, to: 1, not_applicable: true},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
    {
        state: 'OK',
        normal: { from: 7, to: 10 },
        update: { from: 1, to: 1, not_applicable: true},
        extensive_search: { from: 1, to: 1, not_applicable: true }
    },
];
const standard_ETA_columns = [
    { label: 'State', key: 'state' }, 
    { label: 'Normal', key: 'normal' }, 
    { label: 'Update', key: 'update' },
    { label: 'Extensive Search', key: 'extensive_search' },
];

const copy = async (text) => {
    await navigator.clipboard.writeText(text);
}
</script>