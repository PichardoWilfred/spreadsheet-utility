export const useOfficeStore = defineStore('offices', {
    state: () => ({
        states:  [
            { initials: "AL", name: "Alabama" },
            { initials: "AK", name: "Alaska" },
            { initials: "AZ", name: "Arizona" },
            { initials: "AR", name: "Arkansas" },
            { initials: "CA", name: "California" },
            { initials: "CO", name: "Colorado" },
            { initials: "CT", name: "Connecticut" },
            { initials: "DE", name: "Delaware" },
            { initials: "FL", name: "Florida" },
            { initials: "GA", name: "Georgia" },
            { initials: "HI", name: "Hawaii" },
            { initials: "ID", name: "Idaho" },
            { initials: "IL", name: "Illinois" },
            { initials: "IN", name: "Indiana" },
            { initials: "IA", name: "Iowa" },
            { initials: "KS", name: "Kansas" },
            { initials: "KY", name: "Kentucky" },
            { initials: "LA", name: "Louisiana" },
            { initials: "ME", name: "Maine" },
            { initials: "MD", name: "Maryland" },
            { initials: "MA", name: "Massachusetts" },
            { initials: "MI", name: "Michigan" },
            { initials: "MN", name: "Minnesota" },
            { initials: "MS", name: "Mississippi" },
            { initials: "MO", name: "Missouri" },
            { initials: "MT", name: "Montana" },
            { initials: "NE", name: "Nebraska" },
            { initials: "NV", name: "Nevada" },
            { initials: "NH", name: "New Hampshire" },
            { initials: "NJ", name: "New Jersey" },
            { initials: "NM", name: "New Mexico" },
            { initials: "NY", name: "New York" },
            { initials: "NC", name: "North Carolina" },
            { initials: "ND", name: "North Dakota" },
            { initials: "OH", name: "Ohio" },
            { initials: "OK", name: "Oklahoma" },
            { initials: "OR", name: "Oregon" },
            { initials: "PA", name: "Pennsylvania" },
            { initials: "RI", name: "Rhode Island" },
            { initials: "SC", name: "South Carolina" },
            { initials: "SD", name: "South Dakota" },
            { initials: "TN", name: "Tennessee" },
            { initials: "TX", name: "Texas" },
            { initials: "UT", name: "Utah" },
            { initials: "VT", name: "Vermont" },
            { initials: "VA", name: "Virginia" },
            { initials: "WA", name: "Washington" },
            { initials: "WV", name: "West Virginia" },
            { initials: "WI", name: "Wisconsin" },
            { initials: "WY", name: "Wyoming" }
        ],
        status: [
            'Report Completed', 
            'Examiner Workbench', 
            'In Process with Agent',
            'In process with Vendor',
            'In process with Energy',
            'In process with RTT',
            'Quality Control',
            'Extensive Energy',
            'Searching',
            'Vendor Search',
            'Vendor Support',
            'Split and Labeling',
        ]
    })
})