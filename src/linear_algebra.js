
/*
2d and 3d vectors with all the necessary functions
3x3 matrices for rotation
*/

import { cos, sin , round, sign, arccos, atan2, arcsin, tan, abs} from "./utility.js"

export class Vector2{
    constructor(...components){
        this.x = components[0];
        this.y = components[1];
    }


    getLength(){
        return Math.sqrt(this.x**2+this.y**2)
    }

    normalize(){
        const length = this.getLength();
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }

    getNormalized(){
        const length = this.getLength();
        return new Vector3(this.x/length, this.y/length, this.z/length)
    }
}

export class Vector3{
    constructor(...components) {
        this.x = components[0];
        this.y = components[1];
        this.z = components[2];
    }

    getArray(){
        return [this.x, this.y, this.z]
    }

    getLength(){
        return Math.sqrt(this.x**2+this.y**2+this.z**2)
    }

    normalize(){
        const length = this.getLength();
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }

    getNormalized(){
        const length = this.getLength();
        return new Vector3(this.x/length, this.y/length, this.z/length)
    }

    mutliply(factor, inplace=false){
        if(inplace){
            this.x *= factor;
            this.y *= factor;
            this.z *= factor;
            return this;
        }else{
            return new Vector3(this.x*factor, this.y*factor, this.z*factor);
        }
        
    }   

    add(VectorB, inplace = false){
        if(inplace){
            this.x += VectorB.x;
            this.y += VectorB.y;
            this.z += VectorB.z;
            return this
        }
        else{
            return new Vector3(this.x + VectorB.x, this.y+VectorB.y, this.z+VectorB.z)
        }
    }

    getInterceptOnYZPlaneAt(x = -5){
        if(this.x == 0){
            return "no intercept";
        }
        const t = x/this.x;
        if(t <= 0){
            return 
        }
        return [-t*this.y, t* this.z]
    }

    print(){
        return "("+round(this.x,3)+","+round(this.y,3)+","+round(this.z, 3)+")"
    }

    applyMatrix(mat, inplace = false){
        if(inplace){
            const newVect = mat.apply(this);
            this.x = newVect.x;
            this.y = newVect.y;
            this.z = newVect.z;
        }
        else{
            return mat.apply(this);
        }
        
    }

    rotate(x_angle, y_angle, z_angle, inplace=false){
        const newVect = this.applyMatrix(Matrix3x3.Z_Rotation(z_angle))
        newVect.applyMatrix(Matrix3x3.X_Rotation(x_angle), true)
        newVect.applyMatrix(Matrix3x3.Y_Rotation(y_angle), true)

        if(inplace){
            this.x = newVect.x
            this.y = newVect.y
            this.z = newVect.z
        }else{
            return newVect;
        }
    }

    getComponents(){
        return [this.x, this.y, this.z]
    }



    static dot(VectorA, VectorB){
        return VectorA.x*VectorB.x+VectorA.y*VectorB.y+VectorA.z*VectorB.z
    }

    static cross(VectorA, VectorB){
        const a = VectorA.y*VectorB.z-VectorA.z*VectorB.y
        const b = VectorA.z*VectorB.x-VectorA.x*VectorB.z;
        const c = VectorA.x*VectorB.y-VectorB.x*VectorA.y

        return new Vector3(a,b,c);
    }

    static reflect(incidentVector, normalVector){
        return incidentVector.add( normalVector.getNormalized().mutliply(Vector3.dot(incidentVector,normalVector.getNormalized()) * (-2)) )
    }

    static getVectorInBasis(x,y,z,vectorA,vectorB,vectorC){
        const result = vectorA.mutliply(x);
        result.add(vectorB.mutliply(y),inplace=True);
        result.add(vectorC.add(z), inplace = True)
        return result;
    }

    /**
     * 
     * @param {Vector3} VectorA 
     * @param {Vector3} VectorB 
     * @returns angle between VectorA and VectorB
     */
    static getAngle(VectorA, VectorB){
        return arccos(Vector3.dot(VectorA,VectorB)/VectorA.getLength()/VectorB.getLength())
    }
}


export class Matrix3x3{
    constructor(...components) {
        this.a = components[0];
        this.b = components[1];
        this.c = components[2];
    }

   
    apply(vector){
        const result_x = this.a.x*vector.x+this.b.x*vector.y+this.c.x*vector.z
        const result_y = this.a.y*vector.x+this.b.y*vector.y+this.c.y*vector.z
        const result_z = this.a.z*vector.x+this.b.z*vector.y+this.c.z*vector.z
        return new Vector3(result_x, result_y, result_z);
    }

    mutliply(matrixB){
        /**
         * multiplies to matrices together
         * the resulting matrix has components
         * (abc)
         * (def)
         * (ghi)
         */


        const a = this.a.x*matrixB.a.x + this.b.x*matrixB.a.y + this.c.x*matrixB.a.z
        const b = this.a.x*matrixB.b.x + this.b.x*matrixB.b.y + this.c.x*matrixB.b.z
        const c = this.a.x*matrixB.c.x + this.b.x*matrixB.c.y + this.c.x*matrixB.c.z

        const d = this.a.y*matrixB.a.x + this.b.y*matrixB.a.y + this.c.y*matrixB.a.z
        const e = this.a.y*matrixB.b.x + this.b.y*matrixB.b.y + this.c.y*matrixB.b.z
        const f = this.a.y*matrixB.c.x + this.b.y*matrixB.c.y + this.c.y*matrixB.c.z

        const g = this.a.z*matrixB.a.x + this.b.z*matrixB.a.y + this.c.z*matrixB.a.z
        const h = this.a.z*matrixB.b.x + this.b.z*matrixB.b.y + this.c.z*matrixB.b.z
        const i = this.a.z*matrixB.c.x + this.b.z*matrixB.c.y + this.c.z*matrixB.c.z

        return new Matrix3x3(new Vector3(a,d,g), new Vector3(b,e,h), new Vector3(c,f,i))

    }

    show(){
        console.log(`|${round(this.a.x,2)}     ${round(this.b.x,2)}     ${round(this.c.x,2)}|`)
        console.log(`|${round(this.a.y,2)}     ${round(this.b.y,2)}     ${round(this.c.y,2)}|`)
        console.log(`|${round(this.a.z,2)}     ${round(this.b.z,2)}     ${round(this.c.z,2)}|`)
    }

    static Z_Rotation(angle){
        const a = new Vector3(cos(angle), sin(angle),0)
        const b = new Vector3(-sin(angle), cos(angle),0)
        const c = new Vector3(0,0,1)
        return new Matrix3x3(a,b,c);
    }

    static X_Rotation(angle){
        const a = new Vector3(1,0,0)
        const b = new Vector3(0,cos(angle), sin(angle))
        const c = new Vector3(0,-sin(angle), cos(angle))
        return new Matrix3x3(a,b,c);
    }

    static Y_Rotation(angle){
        const a = new Vector3(cos(angle),0,-sin(angle))
        const b = new Vector3(0,1,0)
        const c = new Vector3(sin(angle),0,cos(angle))
        return new Matrix3x3(a,b,c);
    }
    
}

export class Line{
    constructor(point, direction){
        this.point = point;
        this.direction = direction;
    }

    getPointAt(t){
        return this.point.add(this.direction.mutliply(t));
    }
}

export class Plane{
    constructor(point, normalVector){
        this.point = point;
        this.normalVector = normalVector;
    }


    interceptLine(line, min = -Infinity, max = Infinity){

        /*
            calculates the intersection of a line with a plane
        */

        //check if there is any intersection:
        if(Vector3.dot(line.direction, this.normalVector) == 0){
            return(undefined);
        }
        
        const t = ( Vector3.dot(this.point,this.normalVector) - Vector3.dot(line.point, this.normalVector) ) / Vector3.dot(line.direction, this.normalVector);

        if(line.direction.mutliply(t).getLength()*sign(t) < min || line.direction.mutliply(t).getLength() > max){
            return(undefined)
        }
        let result = line.getPointAt(t);
        result
    }
}


/**
 * this function is used to rotate the crystal based on mouse drag in the laue picture.
 * moving the laue picture in the x-direction requires a rotation of the crystal around the z-axis by delta Z etc..
 * so this function returns the new eulers angles x', y', z' that correspond to the complete rotation
 * R_y(y')*R_x(x')*R_z(z') = R_z(deltaZ)*R_y(y)*R_x(x)*R_z(z)
 */
export function rotateEulerAngles(x_start, y_start, z_start, deltaX, deltaY, deltaZ){
    //rotation matrix of the original 3 euler angles
    const originalRotation = Matrix3x3.Y_Rotation(y_start).mutliply(Matrix3x3.X_Rotation(x_start)).mutliply(Matrix3x3.Z_Rotation(z_start))
    //rotation matrix after appliying deltaZ, deltaY, deltaX in that order
    const R = Matrix3x3.X_Rotation(deltaX).mutliply(Matrix3x3.Y_Rotation(deltaY)).mutliply(Matrix3x3.Z_Rotation(deltaZ)).mutliply(originalRotation)
   
    /*
    console.log("original Matrix: ")
    originalRotation.show()
    console.log("rotated Matrix:")
    R.show()
    */
    
    if(R.b.z == -1){
        //console.log("case R.b.z == -1")
        const resultX = 90
        const resultY = atan2(R.b.x, R.a.x)
        const resultZ = 0
        return[resultX,resultY,resultZ]
    }else if (R.b.z == 1){
        //console.log("case R.b.z == 1")
        const resultX = 90
        const resultY = atan2(-R.a.z, R.a.x)
        const resultZ = 0
        return[resultX,resultY,resultZ]
    }else{
        //console.log("sonst")
        let resultX1 = (-1)*arcsin(R.c.y)    
        let resultX2 = 180-resultX1     

        let resultY1 = atan2(R.c.x/cos(resultX1), R.c.z/cos(resultX1))
        let resultY2 = atan2(R.c.x/cos(resultX2), R.c.z/cos(resultX2))

        let resultZ1 = atan2(R.a.y/cos(resultX1), R.b.y/cos(resultX1))
        let resultZ2 = atan2(R.a.y/cos(resultX2), R.b.y/cos(resultX2))

        
        if(resultX1 < 0){
            resultX1 += 360
        }
        if(resultY1 < 0){
            resultY1 += 360
        }
        if(resultZ1 < 0){
            resultZ1 += 360
        }
        if(resultX2 < 0){
            resultX2 += 360
        }
        if(resultY2 < 0){
            resultY2 += 360
        }
        if(resultZ2 < 0){
            resultZ2 += 360
        }


        let resultX = 0;
        let resultY = 0;
        let resultZ = 0;



        if(abs(resultX1-x_start) < abs(resultX2-x_start)){
            resultX = resultX1
            resultY = resultY1
            resultZ = resultZ1

            //console.log(`rejected  ${round(resultX2,2)}, ${round(resultY2,2)}, ${round(resultZ2,2)},`)

        }else{
            resultX = resultX2
            resultY = resultY2
            resultZ = resultZ2
            //console.log(`rejected  ${round(resultX1,2)}, ${round(resultY1,2)}, ${round(resultZ1,2)},`)
        }

        return([resultX, resultY, resultZ])
        //return[resultX1,resultY1,resultZ1,resultX2,resultY2, resultZ2]
    }

}




