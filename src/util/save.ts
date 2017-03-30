/// Data optimised for saving.
export interface Save {
    /// The maximum floor reached
    maxFloor: number,
    /// How many coins got earned
    coins: number
}
/// Load save data.
export function load(): Save | undefined {
    const d = localStorage.getItem(SAVE_ID);
    if (d == undefined)
        return undefined;
    else return JSON.parse(d);
}
/// Save the dave data.
export function save(s: Save) {
    localStorage.setItem(SAVE_ID, JSON.stringify(s));
}
/// The identifier to give the save in the local storage.
const SAVE_ID = "dungeonator-3000";

export default Save;