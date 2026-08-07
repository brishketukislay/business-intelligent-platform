import {
  getDefaultBusinessModel,
  getInputDefinitions,
} from "@/features/inputs/services/input-service";


import {
  InputTable,
} from "@/features/inputs/components/input-table";


import {
  InputForm,
} from "@/features/inputs/components/input-form";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";



export default async function AdminInputsPage() {


  const model =
    await getDefaultBusinessModel();



  if (!model) {

    return (
      <div>
        No active business model found.
      </div>
    );

  }



  const inputs =
    await getInputDefinitions(
      model.id
    );



  return (

    <div className="space-y-6">


      <div>

        <h1 className="text-2xl font-semibold">
          Input Management
        </h1>


        <p className="text-muted-foreground">

          Configure inputs for:
          {" "}
          {model.name}

        </p>

      </div>



      <Card>

        <CardHeader>

          <CardTitle>
            Add Input Definition
          </CardTitle>

        </CardHeader>


        <CardContent>

          <InputForm
            modelId={model.id}
          />

        </CardContent>


      </Card>




      <Card>

        <CardHeader>

          <CardTitle>
            Existing Inputs
          </CardTitle>

        </CardHeader>


        <CardContent>

          <InputTable
            inputs={inputs}
          />

        </CardContent>


      </Card>



    </div>

  );

}
