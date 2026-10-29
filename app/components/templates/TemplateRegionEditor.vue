<script setup lang="ts">
import type { RegionChoice, StyleAspect, TemplateEntry } from '../../types/template'
import { computed } from 'vue'
import { NuxtLink } from '#components'
import { useCatalog } from '../../composables/use-catalog'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { styleAspects } from '../../lib/templates'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'

const props = defineProps<{ region: TemplateEntry['pages'][number]['regions'][number], choice: RegionChoice }>()
const emit = defineEmits<{ change: [choice: RegionChoice] }>()
const { isEnglish, text, termTitle, localePath } = useGlossaryLocale()
const { terms } = useCatalog()
const language = computed(() => isEnglish.value ? 'en' : 'zh')
const relatedTerms = computed(() => terms.value.filter(term => props.region.termSlugs.includes(term.slug)))
function changeAspect(aspect: StyleAspect, isSelected: boolean): void {
  // AI modified: visual toggles change the draft only; the original reference remains unchanged.
  emit('change', {
    ...props.choice,
    aspects: isSelected
      ? [...props.choice.aspects, aspect]
      : props.choice.aspects.filter(saved => saved !== aspect),
  })
}
</script>

<template>
  <section class="region-editor">
    <header><h3>{{ region.title[language] }}</h3><p>{{ region.relation[language] }}</p></header>
    <!-- AI modified: start with the region's authored style; expose individual exclusions on demand. -->
    <p class="region-note">
      {{ text(choice.aspects.length === region.features.length ? '采用该区域整体样式；可以直接补充调整要求。' : '已自定义采用的样式，可展开详细调整查看。') }}
    </p>
    <FieldGroup>
      <Field>
        <FieldLabel :for="`adjustments-${region.id}`">
          {{ text('我的调整要求') }}
        </FieldLabel>
        <Textarea :id="`adjustments-${region.id}`" :model-value="choice.adjustments" maxlength="2000" :placeholder="text('例如：强调色改为深绿色，保留细边框，减少阴影。')" @update:model-value="emit('change', { ...choice, adjustments: String($event) })" />
      </Field>
    </FieldGroup>
    <details :key="region.id" class="region-details">
      <summary>{{ text('详细调整') }}</summary>
      <FieldGroup class="mt-5">
        <Field v-for="feature in region.features" :key="feature.aspect" orientation="horizontal" class="aspect-row">
          <div class="aspect-copy">
            <FieldLabel :for="`aspect-${region.id}-${feature.aspect}`">
              {{ styleAspects.find(aspect => aspect.id === feature.aspect)?.title[language] }}
            </FieldLabel>
            <p :id="`aspect-help-${region.id}-${feature.aspect}`">
              {{ feature.description[language] }}
            </p>
          </div>
          <Switch :id="`aspect-${region.id}-${feature.aspect}`" :model-value="choice.aspects.includes(feature.aspect)" :aria-describedby="`aspect-help-${region.id}-${feature.aspect}`" @update:model-value="changeAspect(feature.aspect, $event)" />
        </Field>
      </FieldGroup>
      <p class="region-note mt-4">
        {{ text('取消某项表示不采用原样式；替代要求需要单独填写。') }}
      </p>
    </details>
    <div v-if="relatedTerms.length" class="region-links">
      <h4>{{ text('关联词条') }}</h4><NuxtLink v-for="term in relatedTerms" :key="term.slug" :to="localePath(`/terms/${term.slug}`)">{{ termTitle(term) }}<small v-if="!isEnglish">{{ term.english }}</small></NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.region-editor { display: flex; flex-direction: column; gap: 20px; }
.region-editor h3 { font-size: 20px; font-weight: 600; }
.region-details summary { cursor: pointer; font-size: 14px; }
.region-editor h4 { font-size: 14px; font-weight: 600; }
.region-editor header p, .aspect-copy p, .region-note { color: var(--muted-foreground); font-size: 12px; line-height: 1.8; }
.region-editor header p { margin-top: 8px; }
.aspect-row { padding-bottom: 16px; border-bottom: 1px solid var(--border); align-items: center; }
.aspect-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.region-links { display: flex; flex-direction: column; gap: 10px; }
.region-links a { color: var(--selection-foreground); font-size: 13px; }
.region-links small { display: block; color: var(--muted-foreground); }
</style>
