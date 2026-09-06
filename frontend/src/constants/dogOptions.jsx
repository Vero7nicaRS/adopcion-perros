export const SEX_OPTIONS = [
    { value: "MALE", label: "Macho" },
    { value: "FEMALE", label: "Hembra" }
];

export const SIZE_OPTIONS = [
    { value: "SMALL", label: "Pequeño" },
    { value: "MEDIUM", label: "Mediano" },
    { value: "LARGE", label: "Grande" }
];

export const AGE_UNIT_OPTIONS = [
    { value: "MONTHS", label: "Meses" },
    { value: "YEARS", label: "Años" }
];

export const COMPATIBLE_OPTIONS = [
    { value: "YES", label: "Sí" },
    { value: "NO", label: "No" },
    { value: "UNKNOWN", label: "Desconocido" }
];

export const ADOPTION_STATUS_OPTIONS = [
    { value: "AVAILABLE", label: "Disponible" },
    { value: "UNAVAILABLE", label: "No disponible" }
];

export const APPLICATIONS_STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendiente" },
    { value: "ACCEPTED", label: "Aceptada" },
    { value: "REJECTED", label: "Rechazada" }  
]
/*
    Cachorro --> menos de 1 año
    Joven    --> 1-2 años
    Adulto   --> 3-7 años
    Senior   --> 8 años o más
*/
export const AGE_OPTIONS = [
    {value: "UNDER_1" , label: "Menos de 1 año"},
    {value: "1_3", label: "1-3 Años"},
    {value: "4_7", label: "4-7 Años"},
    {value: "8_PLUS", label: "Senior"}

]