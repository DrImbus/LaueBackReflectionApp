
//constants
export const PLANCK = 6.62607015 * 10**(-34) //kg*m2*s-1
export const C = 299792458 //ms-1
export const ELEMENTARY_CHARGE = 1.60217663*10**(-19) //C

export function abs(x){
    return Math.abs(x)
}

export function randomFloatBetween(a,b, n=Infinity){
    if(n != Infinity){
        return round(Math.random()*(b-a) + a,n)
    }
    return Math.random()*(b-a) + a
}

export function randomIntBetween(a,b){
    return Math.round(Math.random()*(b-a) + a)
}

export function clamp(num, a, b){
    return Math.max(a, Math.min(num, b));
}

export function sin(x, unit="deg"){
    if(unit=="deg"){
        return Math.sin(x * Math.PI/180);
    }
    else{
        return Math.sin(x);
    }
    
}
export function cos(x, unit="deg"){
    if(unit=="deg"){
        return Math.cos(x * Math.PI/180);
    }
    else{
        return Math.cos(x);
    }
}

export function tan(x){
    return Math.tan(x * Math.PI/180)
}

export function atan2(y,x){
    if(x == 0){
        return 0
    }
    return Math.atan2(y,x)*180/Math.PI;
}

export function arcsin(x){
    return Math.asin(x)*180/Math.PI
}

export function arccos(x, unit="deg"){
    if(unit=="deg"){
        return Math.acos(x)*180/Math.PI
    }
    return Math.acos(x)
}
export function sqrt(x){
    return Math.sqrt(x);
}

export function exp(x){
    return Math.exp(x)
}

export function rectContains(rect, x,y){
    return x >= rect.left & x <= rect.right & y >= rect.top & y <= rect.bottom;
}

export function round(x,n){
    if(n<0){
        return Math.round(x);
    }
    return Math.round(x*10**n)/10**n
}

export function sign(x){
    if(x >= 0){
        return 1
    }
    return -1
}

export function log10(x){
    return Math.log10(x)
}

export function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }


function getHklOfSum(sum=1){
    if(sum < 1){
        return []
    }
    const result = [];
    for(let a = sum; a >= 0; a--){
        for(let b = sum-a; b >= 0; b--){
            const c = sum - a - b
            //console.log("(",a,",",b,",",c,") sum: ", a+b+c);
            result.push([a,b,c])

            //add the hkl's with negative signs
            
            if(a != 0){
                result.push([-a,b,c])
            }
            if(b != 0){
                result.push([a,-b,c])
            }
            if(c != 0){
                result.push([a,b,-c])
            }
            if(a != 0 & b!=0){
                result.push([-a,-b,c])
            }
            if(a != 0 & c!= 0){
                result.push([-a,b,-c])
            }
            if(b != 0 & c!=0){
                result.push([a,-b,-c])
            }
            if(a != 0 & b != 0 & c!= 0){
                result.push([-a,-b,-c])
            }

        }
    }

    return result;
}

export function getHKL(until_sum = 1){
    const result = [];
    for(let i = 1; i <= until_sum; i++){
        result.push(...getHklOfSum(i));
    }
    return result;
}


export function voltage_to_wavelength(u){
    //u in V
    //lambda in m
    return (PLANCK * C / (ELEMENTARY_CHARGE * u))
}

export function wavelength_to_voltage(lambda){
    //u in V
    //lambda in m
    return (PLANCK * C / (ELEMENTARY_CHARGE * lambda))
}

export function distancePythagoras(a,b){
    return sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)
}