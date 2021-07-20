

interface Pokemon {
    id : string;
    attack: number;
    defense: number;
}

interface BaseRecord {
    id : string;
}

interface BeforeSetEvent<T> {
    value: T;
    newValue: T;
}

interface AfterSetEvent<T> {
    value: T;
}


interface Database<T extends BaseRecord> {
    set(newValue : T): void;
    get(id: string): T | undefined;

    onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
    onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void;

}

// Observer

type Listener<EventType> = (ev : EventType) => void;

function createObserver<EventType>(): {
    subscribe: (listener: Listener<EventType>) => () => void;
    publish: (event: EventType) => void;
} {
    let listeners: Listener<EventType>[] = [];
    return {
        subscribe: (listener: Listener<EventType>) : () => void => {
            listeners.push(listener);
            return () => {
                listeners = listeners.filter((l) => l != listener);
            }
        },
        publish: (event: EventType) => {
            listeners.forEach((l) => l(event))  
        }
    }
}




// Factory Pattern
function createDatabase<T extends BaseRecord>() {
    class InMemoryDatabase implements Database<T> {

        private db: Record<string, T> = {};

        public static instance: InMemoryDatabase = new InMemoryDatabase();

        private beforeAddListeners = createObserver<BeforeSetEvent<T>>();
        private afterAddListeners = createObserver<AfterSetEvent<T>>();

        private constructor() {

        }
    
        public set(newValue: T) : void{
            this.beforeAddListeners.publish({
                value: this.db[newValue.id],
                newValue,
            })
            this.db[newValue.id] = newValue;

            this.afterAddListeners.publish({
                value: newValue
            })
        }
    
        public get(id: string) : T | undefined{
            return this.db[id];
        }

        onBeforeAdd(listener: Listener<BeforeSetEvent<T>>) : () => void {
            return this.beforeAddListeners.subscribe(listener);
        }

        onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void {
            return this.afterAddListeners.subscribe(listener);
        }
    }

    // Singleton
    // const db = new InMemoryDatabase();
    // return db;
    return InMemoryDatabase;
}

const PokemonDB = createDatabase<Pokemon>();
// const pokemonDB = createDatabase<Pokemon>();
// const pokemonDB = new PokemonDB();

PokemonDB.instance.set({
    id : "Bulballsaurthanh",
    attack: 50,
    defense: 10,
})


console.log(PokemonDB.instance.get("Bulballsaurthanh"));
