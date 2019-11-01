// ---- Muestras ----------------
    export class User { // NO se exige que se cumpla con todos los campos en el momento de su creacion
        uid: string;
        email: string;
        displayName: string;
        photoURL: string;
        emailVerified: boolean;
    }

    export class Curso {
        constructor( // SI se exige que se cumpla con todos los campos en el momento de su creacion
            public id: number,
            public code: string,
            public name: string,
            public created: Date,
            public obj: Object,
        ) { }
    }
// ---- Basicos -----------------
    export class Sede {
        public nombre: string
        public codigo: string
        public cantidad: Number
        public descripcion: string
        public imagen: string
        public modificacion: string // ojo definir esquema
        public key: string // sedePushID
        constructor() {
            if (!this.imagen) {
                this.imagen = "/assets/shapes.svg";
            }
            if (!this.nombre) {
                this.nombre = "";
            }
            if (!this.codigo) {
                this.codigo = "";
            }
            if (!this.cantidad) {
                this.cantidad = 0;
            }
            if (!this.modificacion) {
                this.modificacion = "";
            }
            if (!this.descripcion) {
                this.descripcion = "";
            }
            if (!this.key) {
                this.key = "";
            }
        }
    }
    export class Ubicacion {
        public nombre: string
        public codigo: string
        public cantidad: Number
        public descripcion: string
        public imagen: string
        public modificacion: string // ojo definir esquema
        public key: string
        public sede: string // sedePushID
        constructor() {
            if (!this.imagen) {
                this.imagen = "/assets/shapes.svg";
            }
            if (!this.nombre) {
                this.nombre = "";
            }
            if (!this.codigo) {
                this.codigo = "";
            }
            if (!this.cantidad) {
                this.cantidad = 0;
            }
            if (!this.modificacion) {
                this.modificacion = "";
            }
            if (!this.descripcion) {
                this.descripcion = "";
            }
            if (!this.key) {
                this.key = "";
            }
            if (!this.sede) {
                this.sede = "";
            }
        }
    }
    export class SubUbicacion {
        public nombre: string
        public codigo: string
        public cantidad: Number
        public descripcion: string
        public imagen: string
        public modificacion: string // ojo definir esquema
        public key: string // SubUbicacionPushID
        public ubicacion: string // UbicacionPushID
        public sede: string // sedePushID
        constructor() {
            if (!this.imagen) {
                this.imagen = "/assets/shapes.svg";
            }
            if (!this.nombre) {
                this.nombre = "";
            }
            if (!this.codigo) {
                this.codigo = "";
            }
            if (!this.cantidad) {
                this.cantidad = 0;
            }
            if (!this.modificacion) {
                this.modificacion = "";
            }
            if (!this.descripcion) {
                this.descripcion = "";
            }
            if (!this.key) {
                this.key = "";
            }
            if (!this.sede) {
                this.sede = "";
            }
            if (!this.ubicacion) {
                this.ubicacion = "";
            }
        }
    }
    export class ArticuloBase {
        public nombre: string
        public tipo: string
        public imagen: string
        public key: string
        public bueno: number = 0
        public malo: number = 0
        public regular: number = 0
        constructor() { 
            if (!this.imagen) {
                this.imagen = "/assets/shapes.svg";
            }
            if (!this.nombre) {
                this.nombre = "";
            }
            if (!this.tipo) {
                this.tipo = "";
            }
            if (!this.bueno) {
                this.bueno = 0;
            }
            if (!this.malo) {
                this.malo = 0;
            }
            if (!this.regular) {
                this.regular = 0;
            }
        }
        get cantidad() {
            return (this.bueno + this.malo + this.regular);
        }
        set Bueno(c) {
            this.bueno += c;
        }
        set Malo(c) {
            this.malo += c;
        }
        set Regular(c) {
            this.regular += c;
        }
        editar(n,t,i){
            this.nombre = n;
            this.tipo = t;
            this.imagen = i;
            return 'se edito el articulo!'
        }
        eliminar(){
            return 'se elimino!'
        }
    }
    export class Articulo {
        public articulo: string
        public cantidad: number
        public codigo: string
        public creacion: number
        public descripcion: string
        public disponibilidad: 'Si'|'No'
        public estado: 'Bueno'|'Malo'|'Regular'
        public etiqueta: string
        public etiquetaId: string
        public fechaEtiqueta: string
        public fechaModif: number
        public imagen: string
        public key: string
        public modificaciones: string
        public nombre: string
        public nombreImagen: string
        public observaciones: string
        public sede: string
        public serie: string
        public subUbicacion: string
        public ubicacion: string
        public valor: number
        constructor() {
            // condiciones iniciales
            if (!this.imagen) {
                this.imagen = "/assets/shapes.svg";
            }
            if (!this.articulo) {
                this.articulo = "";
            }
            if (!this.cantidad) {
                this.cantidad = 0;
            }
            if (!this.codigo) {
                this.codigo = "";
            }
            if (!this.creacion) {
                this.creacion = 0;
            }
            if (!this.descripcion) {
                this.descripcion = "";
            }
            if (!this.disponibilidad) {
                this.disponibilidad = "Si";
            }
            if (!this.estado) {
                this.estado = "Bueno";
            }
            if (!this.etiqueta) {
                this.etiqueta = "";
            }
            if (!this.etiquetaId) {
                this.etiquetaId = "";
            }
            if (!this.fechaEtiqueta) {
                this.fechaEtiqueta = "";
            }
            if (!this.fechaModif) {
                this.fechaModif = 0;
            }
            if (!this.imagen) {
                this.imagen = "";
            }
            if (!this.key) {
                this.key = "";
            }
            if (!this.modificaciones) {
                this.modificaciones = "";
            }
            if (!this.nombre) {
                this.nombre = "";
            }
            if (!this.nombreImagen) {
                this.nombreImagen = "";
            }
            if (!this.observaciones) {
                this.observaciones = "";
            }
            if (!this.sede) {
                this.sede = "";
            }
            if (!this.serie) {
                this.serie = "";
            }
            if (!this.subUbicacion) {
                this.subUbicacion = "";
            }
            if (!this.ubicacion) {
                this.ubicacion = "";
            }
            if (!this.valor) {
                this.valor = 0;
            }
        }
        editar(n,i){
            this.nombre = n;
            this.imagen = i;
            return 'se edito el articulo!'
        }
        eliminar(){
            return 'se elimino!'
        }
    }
// ---- Data Base ---------------
    export class Sheet {
        public titulo: string
        public url: string
        public detallado: any[]
        public values: any[]
        public sheets: any[]
        public range: any[]
        public fecha: number
        constructor() {
            if (!this.fecha) {
                this.fecha = 0;
            }
            if (!this.range) {
                this.range = [];
            }
            if (!this.titulo) {
                this.titulo = "";
            }
            if (!this.url) {
                this.url = "";
            }
            if (!this.values) {
                this.values = [];
            }
            if (!this.sheets) {
                this.sheets = [];
            }
            if (!this.detallado) {
                this.detallado = [];
            }
        }
    }
    export class LocalDatabase {
        public Sedes: { [key: string]: Sede };
        public Ubicaciones: { [key: string]: Ubicacion };
        public SubUbicaciones: { [key: string]: SubUbicacion };
        public Articulos: { [key: string]: Articulo };
        public ArticulosBase: { [key: string]: ArticuloBase };
        public Estados:{ [key: string]: number };
        public Resumen:{ [key: string]: any };
        public Sheets:{ 
            titulo: string,
            url: string,
            key: string,
            fecha: number,
            historial:{[key: string]:{
                fecha: number,
                titulo: string,
                url: string
            }} 
        };
        public Cantidad: number;
        public Actualizar: Boolean;
        total(obj){
            return Object.keys(obj).length;
        }
        cantidad(obj){
            let cantidad = 0;
            Object.keys(obj).forEach(key => {
                cantidad += obj[key].cantidad;
            });
            this.Cantidad = cantidad;
            return cantidad;
        }
        multiFilter(array, filters) {
            return array.filter(o =>
                Object.keys(filters).every(k =>
                    [].concat(filters[k]).some(v => o[k].includes(v))));
        }
        resumen(obj){
            let este = this;
            this.Estados = {};
            this.Estados.bueno = 0;
            this.Estados.malo = 0;
            this.Estados.regular = 0;
            const result = {};
            let array = {};
            const detallado = [];
            Object.keys(obj).map(function(item){
                if(!result[obj[item].articulo]){
                    result[obj[item].articulo]={
                        items:[],
                        nombre: obj[item].nombre,
                        key:obj[item].articulo,
                        cantidad:0,
                        Bueno:0,
                        Malo:0,
                        Regular:0
                    };
                }
                array ={
                    articulo: obj[item].articulo,
                    cantidad: obj[item].cantidad,
                    codigo: obj[item].codigo,
                    creacion: obj[item].creacion,
                    descripcion: obj[item].descripcion,
                    disponibilidad: obj[item].disponibilidad,
                    estado: obj[item].estado,
                    etiqueta: obj[item].etiqueta,
                    etiquetaId: obj[item].etiquetaId,
                    fechaEtiqueta: obj[item].fechaEtiqueta,
                    fechaModif: obj[item].fechaModif,
                    imagen: obj[item].imagen,
                    key: obj[item].key,
                    modificaciones: obj[item].modificaciones,
                    nombre: obj[item].nombre,
                    nombreImagen: obj[item].nombreImagen,
                    observaciones: obj[item].observaciones,
                    sede: obj[item].sede,
                    serie: obj[item].serie,
                    subUbicacion: obj[item].subUbicacion,
                    ubicacion: obj[item].ubicacion,
                    valor: obj[item].valor,
                };
                array['sede'] = este.Sedes[obj[item].sede].nombre
                array['ubicacion'] = este.Ubicaciones[obj[item].ubicacion].nombre
                array['subUbicacion'] = este.SubUbicaciones[obj[item].subUbicacion].nombre
                
                result[obj[item].articulo][obj[item].estado] +=1;
                result[obj[item].articulo].cantidad +=1;
                result[obj[item].articulo].items.push(array);

                if(obj[item].estado == 'Bueno'){
                    este.Estados.bueno += 1;
                }else if(obj[item].estado == 'Malo'){
                    este.Estados.malo += 1;
                }else if(obj[item].estado == 'Regular'){
                    este.Estados.regular += 1;
                }
            });
            const arrayt = [];
            Object.keys(result).map(function(i){
                arrayt.push(result[i]);
            });
            this.Resumen = arrayt;
            return arrayt
        }
        eliminar(){
            return 'se elimino!'
        }
    }
// ------------------------------