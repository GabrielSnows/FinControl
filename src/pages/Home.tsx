import Card from "../components/Card/Card";

export default function Home(){

    return(

        <>

            <h2 className="text-3xl font-bold">

                Dashboard

            </h2>

            <div className="grid md:grid-cols-3 gap-6 mt-8">

                <Card
                    title="Saldo Total"
                    value="R$ 0,00"
                />

                <Card
                    title="Receitas"
                    value="R$ 0,00"
                    color="text-green-400"
                />

                <Card
                    title="Despesas"
                    value="R$ 0,00"
                    color="text-red-400"
                />

            </div>

        </>

    );

}