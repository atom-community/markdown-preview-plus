import { config } from '../src/config'
import { ConfigValues } from 'atom'

export type Config = typeof config
export type ConfigTypes = { [K in keyof Config]: Config[K]['default'] }

export type CV = ConfigValues['markdown-preview-plus']

export const configTest1: CV = (undefined as any) as ConfigTypes
export const configTest2: ConfigTypes = (undefined as any) as CV
