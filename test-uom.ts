
import { createUOM, deleteUOM, getUnitsOfMeasure } from './lib/api/items'

async function testUOM() {
    console.log('Testing createUOM...')
    try {
        const uom = await createUOM('TEST_UOM', 'Test Unit')
        console.log('Created UOM:', uom)

        if (uom) {
            console.log('Deleting UOM...')
            await deleteUOM(uom.id)
            console.log('Deleted UOM')
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

testUOM()
