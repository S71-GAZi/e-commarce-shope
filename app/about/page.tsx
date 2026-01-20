import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Users, Award, Heart, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">About ShopHub</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                We're on a mission to make online shopping simple, enjoyable, and accessible to everyone. Since our
                founding, we've been committed to providing quality products at great prices with exceptional customer
                service.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2020, ShopHub started with a simple idea: create an online marketplace that puts customers
                  first. What began as a small operation has grown into a trusted destination for thousands of shoppers
                  worldwide.
                </p>
                <p>
                  We carefully curate our product selection, working directly with manufacturers and trusted suppliers
                  to ensure quality and value. Every item in our catalog is chosen with our customers in mind.
                </p>
                <p>
                  Today, we're proud to serve a growing community of satisfied customers who trust us for their shopping
                  needs. But we're just getting started—we're constantly working to improve and expand our offerings.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-muted">
              <img src="/modern-office-collaboration.png" alt="Our team" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do and shape how we serve our customers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Customer First</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your satisfaction is our top priority. We go above and beyond to ensure every shopping experience
                    exceeds expectations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Quality Guaranteed</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We stand behind every product we sell. If it doesn't meet our high standards, it doesn't make it to
                    our store.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Fast & Reliable</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quick shipping, easy returns, and responsive support. We respect your time and make shopping
                    hassle-free.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Package className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-muted-foreground">Products</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Award className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">4.8/5</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-muted-foreground">Secure Checkout</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Discover thousands of quality products at great prices. Join our community of satisfied customers today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
