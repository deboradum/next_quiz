import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Create_input_div() {
  return (
    <>
      	<div>
            <div className='flex flex-row justify-around my-1 inputDiv'>
                <div className="mt-1 rounded-md shadow-sm w-5/12">
                    <input name='front-card' type="text" className={"bg-white py-2 w-full text-gray-700 rounded-md border-gray-300 pl-7 pr-12 focus:border-orange-300 focus:ring-orange-300 sm:text-sm"} placeholder="Front of the card"/>
                </div>
                <div className="mt-1 rounded-md shadow-sm w-5/12">
                    <input name='back-card' type="text" className={'bg-white py-2 w-full text-gray-700 rounded-md border-gray-300 pl-7 pr-12 focus:border-orange-300 focus:ring-orange-300 sm:text-sm'} placeholder="Back of the card"/>
                </div>
            </div>
        </div>
    </>
  )
}
