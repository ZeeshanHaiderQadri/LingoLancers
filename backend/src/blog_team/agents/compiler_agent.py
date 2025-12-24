"""
Compiler Agent for Blog Writing Team
Assembles all components into final article with quality checks
Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.1, 14.2, 14.3, 14.4, 14.5
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import re


@dataclass
class QualityCheck:
    """Quality check result"""
    check_name: str
    passed: bool
    score: float
    message: str


@dataclass
class CompiledArticle:
    """Final compiled article ready for review/publishing"""
    title: str
    meta_description: str
    feature_image: Dict[str, Any]
    content_html: str
    content_markdown: str
    seo_score: float
    readability_score: float
    quality_checks: List[QualityCheck]
    word_count: int
    keyword_usage: Dict[str, int]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'title': self.title,
            'meta_description': self.meta_description,
            'feature_image': self.feature_image,
            'content_html': self.content_html,
            'content_markdown': self.content_markdown,
            'seo_score': self.seo_score,
            'readability_score': self.readability_score,
            'quality_checks': [
                {
                    'check_name': qc.check_name,
                    'passed': qc.passed,
                    'score': qc.score,
                    'message': qc.message
                }
                for qc in self.quality_checks
            ],
            'word_count': self.word_count,
            'keyword_usage': self.keyword_usage
        }


class CompilerAgentError(Exception):
    """Base exception for compiler agent errors"""
    pass


class CompilerAgent:
    """
    Compiler agent that assembles all components into final article
    """
    
    def __init__(self):
        """Initialize compiler agent"""
        self.min_seo_score = 70.0
        self.min_readability_score = 60.0
    
    async def execute(
        self,
        article_draft,
        seo_result,
        feature_image_result,
        supporting_images_result
    ) -> CompiledArticle:
        """
        Compile all components into final article
        
        Args:
            article_draft: ArticleDraft from writer agent
            seo_result: SEOResult from SEO agent
            feature_image_result: ImageResult from feature image agent
            supporting_images_result: SupportingImagesResult from image finder
            
        Returns:
            CompiledArticle ready for review/publishing
        """
        try:
            # Insert images into sections
            sections_with_images = self._insert_images_into_sections(
                article_draft.sections,
                supporting_images_result.images
            )
            
            # Generate HTML format
            html_content = self._generate_html(
                article_draft,
                sections_with_images,
                feature_image_result
            )
            
            # Generate Markdown format
            markdown_content = self._generate_markdown(
                article_draft,
                sections_with_images,
                feature_image_result
            )
            
            # Calculate SEO score
            seo_score = self._calculate_seo_score(article_draft, seo_result)
            
            # Calculate readability score
            readability_score = self._calculate_readability_score(article_draft)
            
            # Run quality checks
            quality_checks = self._run_quality_checks(
                article_draft,
                seo_result,
                feature_image_result,
                supporting_images_result
            )
            
            return CompiledArticle(
                title=article_draft.title,
                meta_description=seo_result.meta_description,
                feature_image=feature_image_result.to_dict(),
                content_html=html_content,
                content_markdown=markdown_content,
                seo_score=seo_score,
                readability_score=readability_score,
                quality_checks=quality_checks,
                word_count=article_draft.word_count,
                keyword_usage=article_draft.seo_keywords_used
            )
            
        except Exception as e:
            if isinstance(e, CompilerAgentError):
                raise
            raise CompilerAgentError(f"Article compilation failed: {e}")
    
    def _insert_images_into_sections(self, sections, images) -> List[Dict[str, Any]]:
        """Insert supporting images into appropriate sections"""
        sections_with_images = []
        
        # Create image map by section heading
        image_map = {img.section_heading: img for img in images}
        
        for section in sections:
            section_data = {
                'heading': section.heading,
                'content': section.content,
                'image': None
            }
            
            # Find matching image
            if section.heading in image_map:
                img = image_map[section.heading]
                section_data['image'] = {
                    'url': img.image_url,
                    'alt': img.alt_text,
                    'attribution': img.attribution
                }
            
            sections_with_images.append(section_data)
        
        return sections_with_images
    
    def _generate_html(self, article, sections_with_images, feature_image) -> str:
        """Generate HTML format"""
        html_parts = []
        
        # Title
        html_parts.append(f'<h1>{article.title}</h1>')
        
        # Feature image
        html_parts.append(
            f'<img src="{feature_image.image_url}" '
            f'alt="{feature_image.alt_text}" class="feature-image" />'
        )
        
        # Introduction
        html_parts.append(f'<div class="introduction">{self._text_to_html(article.introduction)}</div>')
        
        # Sections with images
        for section in sections_with_images:
            html_parts.append(f'<h2>{section["heading"]}</h2>')
            
            if section['image']:
                img = section['image']
                html_parts.append(
                    f'<img src="{img["url"]}" alt="{img["alt"]}" class="section-image" />'
                )
                html_parts.append(
                    f'<p class="attribution"><small>{self._format_attribution(img["attribution"])}</small></p>'
                )
            
            html_parts.append(f'<div class="section-content">{self._text_to_html(section["content"])}</div>')
        
        # Conclusion
        html_parts.append(f'<h2>Conclusion</h2>')
        html_parts.append(f'<div class="conclusion">{self._text_to_html(article.conclusion)}</div>')
        
        return '\n'.join(html_parts)
    
    def _generate_markdown(self, article, sections_with_images, feature_image) -> str:
        """Generate Markdown format"""
        md_parts = []
        
        # Title
        md_parts.append(f'# {article.title}\n')
        
        # Feature image
        md_parts.append(f'![{feature_image.alt_text}]({feature_image.image_url})\n')
        
        # Introduction
        md_parts.append(f'{article.introduction}\n')
        
        # Sections with images
        for section in sections_with_images:
            md_parts.append(f'## {section["heading"]}\n')
            
            if section['image']:
                img = section['image']
                md_parts.append(f'![{img["alt"]}]({img["url"]})\n')
                md_parts.append(f'*{self._format_attribution(img["attribution"])}*\n')
            
            md_parts.append(f'{section["content"]}\n')
        
        # Conclusion
        md_parts.append(f'## Conclusion\n')
        md_parts.append(f'{article.conclusion}\n')
        
        return '\n'.join(md_parts)
    
    def _text_to_html(self, text: str) -> str:
        """Convert plain text to HTML paragraphs"""
        paragraphs = text.strip().split('\n\n')
        return ''.join(f'<p>{p.strip()}</p>' for p in paragraphs if p.strip())
    
    def _format_attribution(self, attribution: Dict[str, str]) -> str:
        """Format image attribution"""
        return (
            f"Photo by {attribution['photographer_name']} on {attribution['platform']}"
        )
    
    def _calculate_seo_score(self, article, seo_result) -> float:
        """Calculate SEO score (0-100)"""
        score = 0.0
        max_score = 100.0
        
        # Keyword usage (40 points)
        primary_keywords = seo_result.primary_keywords
        keywords_used = sum(1 for kw in primary_keywords if kw in article.seo_keywords_used)
        score += (keywords_used / len(primary_keywords)) * 40 if primary_keywords else 0
        
        # Word count (20 points)
        if 800 <= article.word_count <= 2500:
            score += 20
        elif 500 <= article.word_count < 800 or 2500 < article.word_count <= 3000:
            score += 10
        
        # Title length (15 points)
        if 30 <= len(article.title) <= 60:
            score += 15
        elif 20 <= len(article.title) < 30 or 60 < len(article.title) <= 70:
            score += 7
        
        # Structure (15 points)
        if len(article.sections) >= 3:
            score += 15
        elif len(article.sections) >= 2:
            score += 10
        
        # Introduction and conclusion (10 points)
        if len(article.introduction) > 100 and len(article.conclusion) > 50:
            score += 10
        
        return min(score, max_score)
    
    def _calculate_readability_score(self, article) -> float:
        """Calculate readability score (0-100)"""
        score = 0.0
        
        # Average sentence length (30 points)
        sentences = re.split(r'[.!?]+', article.introduction + ' '.join(s.content for s in article.sections))
        sentences = [s.strip() for s in sentences if s.strip()]
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        if 15 <= avg_sentence_length <= 20:
            score += 30
        elif 10 <= avg_sentence_length < 15 or 20 < avg_sentence_length <= 25:
            score += 20
        
        # Paragraph structure (30 points)
        total_paragraphs = article.introduction.count('\n\n') + sum(s.content.count('\n\n') for s in article.sections)
        if total_paragraphs >= 5:
            score += 30
        elif total_paragraphs >= 3:
            score += 20
        
        # Section count (20 points)
        if 3 <= len(article.sections) <= 6:
            score += 20
        elif len(article.sections) >= 2:
            score += 10
        
        # Word variety (20 points) - simple check
        all_text = article.introduction + ' '.join(s.content for s in article.sections)
        unique_words = len(set(all_text.lower().split()))
        total_words = len(all_text.split())
        variety_ratio = unique_words / total_words if total_words > 0 else 0
        
        if variety_ratio > 0.5:
            score += 20
        elif variety_ratio > 0.4:
            score += 10
        
        return min(score, 100.0)
    
    def _run_quality_checks(
        self,
        article,
        seo_result,
        feature_image,
        supporting_images
    ) -> List[QualityCheck]:
        """Run quality checks on compiled article"""
        checks = []
        
        # Check 1: Keyword usage
        primary_used = sum(1 for kw in seo_result.primary_keywords if kw in article.seo_keywords_used)
        keyword_score = (primary_used / len(seo_result.primary_keywords)) * 100 if seo_result.primary_keywords else 0
        checks.append(QualityCheck(
            check_name="Keyword Usage",
            passed=keyword_score >= 66,
            score=keyword_score,
            message=f"{primary_used}/{len(seo_result.primary_keywords)} primary keywords used"
        ))
        
        # Check 2: Image attribution
        all_images_have_attribution = all(
            img.attribution for img in supporting_images.images
        )
        checks.append(QualityCheck(
            check_name="Image Attribution",
            passed=all_images_have_attribution,
            score=100.0 if all_images_have_attribution else 0.0,
            message="All images have proper attribution" if all_images_have_attribution else "Missing attribution"
        ))
        
        # Check 3: Article structure
        has_structure = (
            len(article.title) > 0 and
            len(article.introduction) > 100 and
            len(article.sections) >= 2 and
            len(article.conclusion) > 50
        )
        checks.append(QualityCheck(
            check_name="Article Structure",
            passed=has_structure,
            score=100.0 if has_structure else 50.0,
            message="Complete structure" if has_structure else "Structure needs improvement"
        ))
        
        # Check 4: Word count
        word_count_ok = 500 <= article.word_count <= 3000
        checks.append(QualityCheck(
            check_name="Word Count",
            passed=word_count_ok,
            score=100.0 if word_count_ok else 50.0,
            message=f"{article.word_count} words (target: 500-3000)"
        ))
        
        # Check 5: Images present
        has_images = feature_image is not None and len(supporting_images.images) > 0
        checks.append(QualityCheck(
            check_name="Images Present",
            passed=has_images,
            score=100.0 if has_images else 0.0,
            message=f"Feature image + {len(supporting_images.images)} supporting images"
        ))
        
        return checks
    
    def get_overall_quality_score(self, compiled_article: CompiledArticle) -> float:
        """Calculate overall quality score"""
        if not compiled_article.quality_checks:
            return 0.0
        
        total_score = sum(check.score for check in compiled_article.quality_checks)
        return total_score / len(compiled_article.quality_checks)
    
    def is_ready_for_publishing(self, compiled_article: CompiledArticle) -> bool:
        """Check if article meets minimum quality standards"""
        return (
            compiled_article.seo_score >= self.min_seo_score and
            compiled_article.readability_score >= self.min_readability_score and
            all(check.passed for check in compiled_article.quality_checks)
        )
