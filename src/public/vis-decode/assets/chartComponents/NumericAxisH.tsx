import * as d3 from 'd3'; 
import { useMemo } from 'react'; 

interface NumericAxisHProps {
    domain: [number, number]; 
    range: [number, number]; 
}

export function NumericAxisH({
    domain = [0, 1], 
    range = [0, 100]
}: NumericAxisHProps) {

}