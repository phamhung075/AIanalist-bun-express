// decorators/bind-methods.decorator.ts
export function BindMethods() {
    return function <T extends { new (...args: any[]): any }>(target: T) {
        return class extends target {
            constructor(...args: any[]) {
                super(...args);
                // Get methods from both the class and its parent
                const getAllMethods = (obj: any): string[] => {
                    let methods: string[] = [];
                    let currentObj = obj;
                    
                    while (currentObj) {
                        const props = Object.getOwnPropertyNames(currentObj);
                        methods = methods.concat(props.filter(prop => 
                            typeof currentObj[prop] === 'function' && 
                            prop !== 'constructor'
                        ));
                        currentObj = Object.getPrototypeOf(currentObj);
                        
                        // Stop when we reach Object's prototype
                        if (currentObj === Object.prototype) break;
                    }
                    return [...new Set(methods)]; // Remove duplicates
                };

                const methods = getAllMethods(target.prototype);
                methods.forEach(method => {
                    if (this[method]) {
                        this[method] = this[method].bind(this);
                    }
                });
            }
        } as T;
    };
}