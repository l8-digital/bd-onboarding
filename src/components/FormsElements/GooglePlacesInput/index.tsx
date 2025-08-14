/// <reference types="@types/google.maps" />
import {useRef, useEffect} from "react";
import {loadGoogleMapsScript} from "../../../utils/loadGoogleMaps";
import styles from './../style.module.scss';

interface AddressData {
    address: string;
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelected?: (data: AddressData) => void; // chamada só quando seleciona da lista
    label?: string;
}

export function GooglePlacesInput({ value, onChange, onPlaceSelected, label }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        const init = async () => {
            await loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

            if (inputRef.current && window.google && !autocompleteRef.current) {
                autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                    types: ["address"],
                    componentRestrictions: { country: "br" },
                });

                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current?.getPlace();
                    if (!place || !place.address_components) return;

                    const get = (type: string) =>
                        place.address_components?.find(c => c.types.includes(type))?.long_name || "";

                    const data: AddressData = {
                        address: place.formatted_address || "",
                        cep: get("postal_code"),
                        street: get("route"),
                        number: get("street_number"),
                        neighborhood: get("sublocality") || get("sublocality_level_1") || get("neighborhood"),
                        city: get("administrative_area_level_2"),
                        state: get("administrative_area_level_1"),
                    };

                    onPlaceSelected?.(data);
                });
            }
        };

        init();
    }, []);

    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor="address" className={`${styles.cFloat__label}`}>{label}</label>}
            <input
                ref={inputRef}
                id="address"
                name="address-input" // nome atípico
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Digite seu endereço"
                className={`${styles.cFloat__input}`}
                autoComplete="new-address" // nome fictício
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
            />
        </div>

    );
}

