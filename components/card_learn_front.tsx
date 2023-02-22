import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Card_learn_front({word, f}:{word:string, f:()=>void}) {
  return (
    <>
      	<div onClick={() => f()} id='quiz-div-frontback' className=' rounded-md bg-orange-300 md:h-64 md:w-1/4 flex justify-center items-center hover:cursor-pointer' title='Click to flip card'>
            <span className='text-5xl break-all px-5'>{word}</span>
        </div>
    </>
  )
}
